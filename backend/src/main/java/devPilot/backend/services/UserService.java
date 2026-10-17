package devPilot.backend.services;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.entity.User;
import devPilot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
public class UserService {
    public final UserRepository userRepository;
    public final TextEncryptor textEncryptor;

    @Transactional
    public User upsertFromGithub(Map<String, Object> attributes, String accessToken, String scopes) {
        Long githubId = Long.valueOf(attributes.get("id").toString());
        String login = String.valueOf(attributes.get("login"));
        String name = attributes.get("name") != null
                ? String.valueOf(attributes.get("name"))
                : login;
        String avatarUrl = attributes.get("avatar_url") != null
                ? String.valueOf(attributes.get("avatar_url"))
                : null;

        String encryptedToken = textEncryptor.encrypt(accessToken);

        User user = userRepository.findByGithubId(githubId).orElseGet(User::new);
        user.setGithubId(githubId);
        user.setGithubUsername(login);
        user.setDisplayName(name);
        user.setAvatarUrl(avatarUrl);
        user.setAccessToken(encryptedToken);
        user.setTokenScope(scopes);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User requiredById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public String decryptAccessToken(User user) {
        return textEncryptor.decrypt(user.getAccessToken());
    }

    private static Long toLong(Object value) {
        if(value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    
}
