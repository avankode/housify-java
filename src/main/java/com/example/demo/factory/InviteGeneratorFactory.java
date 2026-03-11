package com.example.demo.factory;

import com.example.demo.model.TemporaryInvite;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class InviteGeneratorFactory {
    private final List<InviteGenerator> generators;

    public InviteGenerator getGenerator(TemporaryInvite.InviteType type) {
        Map<TemporaryInvite.InviteType, InviteGenerator> generatorMap = generators.stream()
                .collect(Collectors.toMap(InviteGenerator::getType, Function.identity()));
        return generatorMap.get(type);
    }
}
