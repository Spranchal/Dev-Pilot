package devPilot.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import devPilot.backend.security.GithubOAuth2UserService;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity 
@RequiredArgsConstructor
public class SecurityConfig {

    private final GithubOAuth2UserService gitHubOAuth2UserService;

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    private static boolean isValidFrontendOrigin(String origin) {
        if (origin == null || origin.isBlank()) return false;
        return origin.startsWith("http://localhost:")
                || origin.startsWith("http://127.0.0.1:")
                || origin.matches("^https://[a-zA-Z0-9-]+\\.vercel\\.app$");
    }

    @Bean
    OAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver defaultResolver =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
        defaultResolver.setAuthorizationRequestCustomizer(customizer ->
                customizer.additionalParameters(params -> params.put("prompt", "select_account"))
        );

        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest resolve(jakarta.servlet.http.HttpServletRequest request) {
                saveReturnTo(request);
                return defaultResolver.resolve(request);
            }

            @Override
            public org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest resolve(jakarta.servlet.http.HttpServletRequest request, String clientRegistrationId) {
                saveReturnTo(request);
                return defaultResolver.resolve(request, clientRegistrationId);
            }

            private void saveReturnTo(jakarta.servlet.http.HttpServletRequest request) {
                String returnTo = request.getParameter("return_to");
                if (returnTo == null || returnTo.isBlank()) {
                    String referer = request.getHeader("Referer");
                    if (referer != null && !referer.isBlank()) {
                        try {
                            java.net.URI uri = java.net.URI.create(referer);
                            returnTo = uri.getScheme() + "://" + uri.getAuthority();
                        } catch (Exception ignored) {}
                    }
                }
                if (returnTo != null && isValidFrontendOrigin(returnTo)) {
                    request.getSession().setAttribute("REDIRECT_TO_FRONTEND", returnTo);
                }
            }
        };
    }

    @Bean 
    SecurityFilterChain securityFilterChain(
            HttpSecurity http, 
            AuthenticationSuccessHandler oauth2SuccessHandler, 
            AuthenticationFailureHandler oauth2FailureHandler,
            SecurityContextRepository securityContextRepository,
            OAuth2AuthorizationRequestResolver authorizationRequestResolver) throws Exception {
        http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .securityContext(context -> context
            .securityContextRepository(securityContextRepository))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/login-url",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/error")
                    .permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll())
                .exceptionHandling(ex ->
                    ex.authenticationEntryPoint(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                    )
                )
                .oauth2Login(oauth -> oauth
                    .authorizationEndpoint(auth -> auth
                        .authorizationRequestResolver(authorizationRequestResolver))
                    .userInfoEndpoint(userInfo -> userInfo
                        .userService(gitHubOAuth2UserService))
                    .successHandler(oauth2SuccessHandler)
                    .failureHandler(oauth2FailureHandler))
                
                .logout(logout -> logout
                    .logoutUrl("/api/auth/logout")
                    .logoutSuccessHandler((request, response, authentication) ->
                        response.setStatus(HttpStatus.NO_CONTENT.value()))
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("DEVPILOT_SESSION"));
                    

                return http.build();
    }

    @Bean
    AuthenticationSuccessHandler oauth2SuccessHandler(
            @Value("${app.frontend-url}") String defaultFrontendUrl) {

        return (request, response, authentication) -> {
            String targetUrl = (String) request.getSession().getAttribute("REDIRECT_TO_FRONTEND");
            if (targetUrl == null || !isValidFrontendOrigin(targetUrl)) {
                targetUrl = defaultFrontendUrl;
            }
            if (targetUrl.endsWith("/")) {
                targetUrl = targetUrl.substring(0, targetUrl.length() - 1);
            }
            response.sendRedirect(targetUrl + "/auth/callback");
        };
    }

    @Bean
    AuthenticationFailureHandler oauth2FailureHandler(
            @Value("${app.frontend-url}") String defaultFrontendUrl) {

        return (request, response, exception) -> {
            String targetUrl = (String) request.getSession().getAttribute("REDIRECT_TO_FRONTEND");
            if (targetUrl == null || !isValidFrontendOrigin(targetUrl)) {
                targetUrl = defaultFrontendUrl;
            }
            if (targetUrl.endsWith("/")) {
                targetUrl = targetUrl.substring(0, targetUrl.length() - 1);
            }
            response.sendRedirect(targetUrl + "/login?error=oauth_failed");
        };
    }
    
}
