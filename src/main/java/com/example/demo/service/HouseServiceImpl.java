package com.example.demo.service;

import com.example.demo.dto.CreateInviteDTO;
import com.example.demo.dto.HouseDTO;
import com.example.demo.dto.UseInviteDTO;
import com.example.demo.factory.InviteGenerator;
import com.example.demo.factory.InviteGeneratorFactory;
import com.example.demo.model.House;
import com.example.demo.model.TemporaryInvite;
import com.example.demo.model.User;
import com.example.demo.repository.HouseRepository;
import com.example.demo.repository.TemporaryInviteRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class HouseServiceImpl implements HouseService {

    private final HouseRepository houseRepository;
    private final UserRepository userRepository;
    private final TemporaryInviteRepository inviteRepository;
    private final MappingService mappingService;
    private final InviteGeneratorFactory inviteFactory;

    @Override
    @Transactional
    public HouseDTO createHouse(User user, String houseName) {
        House house = House.builder()
                .name(houseName)
                .admin(user)
                .build();
        house = houseRepository.save(house);
        user.setHouse(house);
        userRepository.save(user);
        log.info("House '{}' created by {}", houseName, user.getEmail());
        return mappingService.mapToHouseDTO(house);
    }

    @Override
    @Transactional
    public TemporaryInvite createInvite(User user, CreateInviteDTO dto) {
        House house = user.getHouse();
        if (house == null || !house.getAdmin().equals(user)) {
            throw new RuntimeException("Only admins can create invites.");
        }

        TemporaryInvite.InviteType type = TemporaryInvite.InviteType.valueOf(dto.getInviteType().toUpperCase());
        InviteGenerator generator = inviteFactory.getGenerator(type);
        
        if (generator == null) {
            throw new RuntimeException("Unsupported invite type: " + type);
        }

        TemporaryInvite invite = TemporaryInvite.builder()
                .house(house)
                .code(generator.generateCode())
                .inviteType(type)
                .expiresAt(generator.getExpiryTime())
                .build();
        
        log.info("Invite ({}) created for house '{}' by {}", type, house.getName(), user.getEmail());
        return inviteRepository.save(invite);
    }

    @Override
    @Transactional
    public HouseDTO useInvite(User user, UseInviteDTO dto) {
        if (user.getHouse() != null) {
            log.warn("User {} attempted to join a house but is already in one", user.getEmail());
            throw new RuntimeException("You are already in a house.");
        }

        TemporaryInvite invite = inviteRepository.findByCode(dto.getCode())
                .orElseThrow(() -> new RuntimeException("Invalid invite code."));

        if (invite.isExpired()) {
            log.warn("User {} attempted to use an expired invite code", user.getEmail());
            throw new RuntimeException("Invite expired.");
        }

        House house = invite.getHouse();
        user.setHouse(house);
        userRepository.save(user);
        inviteRepository.delete(invite);
        log.info("User {} joined house '{}'", user.getEmail(), house.getName());
        return mappingService.mapToHouseDTO(house);
    }

    @Override
    @Transactional
    public void leaveHouse(User user) {
        House house = user.getHouse();
        if (house == null) throw new RuntimeException("Not in a house.");
        if (house.getAdmin().equals(user)) throw new RuntimeException("Admins cannot leave. Transfer adminship first.");

        user.setHouse(null);
        userRepository.save(user);
        log.info("User {} left house '{}'", user.getEmail(), house.getName());
    }

    @Override
    @Transactional
    public void deleteHouse(User user) {
        House house = user.getHouse();
        if (house == null || !house.getAdmin().equals(user)) {
            throw new RuntimeException("Only admins can delete the house.");
        }
        log.info("House '{}' deleted by admin {}", house.getName(), user.getEmail());
        houseRepository.delete(house);
    }

    @Override
    @Transactional
    public void transferAdmin(User user, Long newAdminId) {
        House house = user.getHouse();
        if (house == null || !house.getAdmin().equals(user)) {
            throw new RuntimeException("Only admins can transfer adminship.");
        }

        User newAdmin = userRepository.findById(newAdminId)
                .orElseThrow(() -> new RuntimeException("New admin not found"));

        if (!newAdmin.getHouse().equals(house)) {
            throw new RuntimeException("The selected user is not a member of this house.");
        }

        house.setAdmin(newAdmin);
        houseRepository.save(house);
        log.info("Admin of house '{}' transferred from {} to {}", house.getName(), user.getEmail(), newAdmin.getEmail());
    }
}
