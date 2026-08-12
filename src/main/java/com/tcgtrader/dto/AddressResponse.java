package com.tcgtrader.dto;

import com.tcgtrader.entity.Address;

import java.util.UUID;

public record AddressResponse(UUID id, String street, String city, String country, String zipCode) {
    public static AddressResponse from(Address a) {
        return new AddressResponse(a.getId(), a.getStreet(), a.getCity(), a.getCountry(), a.getZipCode());
    }
}
