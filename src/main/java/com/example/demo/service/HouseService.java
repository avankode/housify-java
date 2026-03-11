package com.example.demo.service;

import com.example.demo.dto.CreateInviteDTO;
import com.example.demo.dto.HouseDTO;
import com.example.demo.dto.UseInviteDTO;
import com.example.demo.model.TemporaryInvite;
import com.example.demo.model.User;
import java.util.Map;

public interface HouseService {
    HouseDTO createHouse(User user, String houseName);
    TemporaryInvite createInvite(User user, CreateInviteDTO dto);
    HouseDTO useInvite(User user, UseInviteDTO dto);
    void leaveHouse(User user);
    void deleteHouse(User user);
    void transferAdmin(User user, Long newAdminId);
}
