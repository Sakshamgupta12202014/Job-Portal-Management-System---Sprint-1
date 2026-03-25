package com.capg.jobportal.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.capg.jobportal.entity.User;
import com.capg.jobportal.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User , Long> {
	
	Optional<User> findByEmail(String email);
	 
    boolean existsByEmail(String email);
 
    Optional<User> findByRefreshToken(String refreshToken);
    
    // In UserRepository.java — add this one line
    List<User> findByRole(Role role);
}
