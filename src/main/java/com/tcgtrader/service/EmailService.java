package com.tcgtrader.service;



public interface EmailService {
    void sendOrderConfirmation(String to, String orderId, double total);
}   
