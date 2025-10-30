package com.assessment.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("file:/opt/static/", "classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        // If resource exists and is not a directory, return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // If the path starts with /api or /public, don't fallback to index.html
                        if (resourcePath.startsWith("api/") || resourcePath.startsWith("public/") || resourcePath.startsWith("actuator/")) {
                            return null;
                        }
                        
                        // For all other paths (like /login, /admin, etc.), return index.html for SPA routing
                        Resource indexHtml = new ClassPathResource("static/index.html");
                        if (!indexHtml.exists()) {
                            indexHtml = location.createRelative("index.html");
                        }
                        
                        return indexHtml.exists() && indexHtml.isReadable() ? indexHtml : null;
                    }
                });
    }
}
