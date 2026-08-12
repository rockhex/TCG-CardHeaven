package com.tcgtrader.config;

import com.tcgtrader.entity.Cart;
import com.tcgtrader.entity.Role;
import com.tcgtrader.entity.User;
import com.tcgtrader.repository.RoleRepository;
import com.tcgtrader.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final UUID ADMIN_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${tcgtrader.default-admin.email:admin@tcgtrader.com}")
    private String adminEmail;

    @Value("${tcgtrader.default-admin.password:admin123}")
    private String adminPassword;

    @Value("${tcgtrader.default-admin.name:Default Admin}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Default admin already exists: {}", adminEmail);
            return;
        }
        Role adminRole = roleRepository.findById(ADMIN_ROLE_ID)
                .orElseThrow(() -> new IllegalStateException("Admin role not seeded: " + ADMIN_ROLE_ID));

        User admin = User.builder()
                .role(adminRole)
                .name(adminName)
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .build();
        admin.setCart(Cart.builder().user(admin).build());
        userRepository.save(admin);
        log.info("Seeded default admin user '{}' (password: '{}')", adminEmail, adminPassword);
    }
}
