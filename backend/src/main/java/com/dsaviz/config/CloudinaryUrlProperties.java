package com.dsaviz.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryUrlProperties {

    /** Full Cloudinary connection URL, e.g. cloudinary://key:secret@cloud. */
    private String url = "";

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
