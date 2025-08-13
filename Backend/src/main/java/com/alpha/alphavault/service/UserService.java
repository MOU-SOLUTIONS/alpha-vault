package com.alpha.alphavault.service;

import com.alpha.alphavault.model.User;
import com.alpha.alphavault.repository.UserRepository;
import com.alpha.alphavault.exception.UserNotFoundException;
import com.alpha.alphavault.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Create or update a user
    public User saveUser(User user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new UserException("Error saving user: " + e.getMessage());
        }
    }

    // Delete a user
    public void deleteUser(Long id) {
        try {
            if (!userRepository.existsById(id)) {
                throw new UserNotFoundException("User not found for id: " + id);
            }
            userRepository.deleteById(id);
        } catch (UserNotFoundException e) {
            throw e; // Rethrow custom exception if user is not found
        } catch (Exception e) {
            throw new UserException("Error deleting user: " + e.getMessage());
        }
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
    }

    // Get user by email
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for email: " + email));
    }


}
