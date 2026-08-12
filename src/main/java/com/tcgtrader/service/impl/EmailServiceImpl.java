package com.tcgtrader.service.impl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.tcgtrader.entity.Order;
import com.tcgtrader.entity.User;

@Service

public class EmailServiceImpl {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(User user, Order order) {
         StringBuilder body = new StringBuilder();

        body.append("¡Gracias por tu compra!\n\n");
        body.append("Orden: ").append(order.getId()).append("\n");
        body.append("Total: $").append(order.getTotalAmount()).append("\n\n");
        body.append("Productos:\n");

        order.getItems().forEach(item -> {
            body.append("- ")
                .append(item.getItem().getCard())
                .append(" x")
                .append(item.getQuantity())
                .append(" ($")
                .append(item.getUnitPrice())
                .append(")\n");
        });

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Confirmación de compra #" + order.getId());
        message.setText(body.toString());

        mailSender.send(message);
    }
    }

