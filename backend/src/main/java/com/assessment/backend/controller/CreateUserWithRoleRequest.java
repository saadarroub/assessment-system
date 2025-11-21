package com.assessment.backend.controller;

import java.util.UUID;

public class CreateUserWithRoleRequest {
    public String name;
    public String email;
    public String password;
    public UUID roleId;
}