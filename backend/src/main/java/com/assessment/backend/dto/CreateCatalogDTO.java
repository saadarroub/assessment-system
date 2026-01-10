package com.assessment.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * DTO für das Erstellen eines Katalogs.
 * Ermöglicht die optionale Zuweisung eines Reifegradmodells.
 */
public class CreateCatalogDTO {

    @NotBlank(message = "Titel ist erforderlich")
    @Size(max = 255, message = "Titel darf maximal 255 Zeichen haben")
    private String title;

    @Size(max = 2000, message = "Beschreibung darf maximal 2000 Zeichen haben")
    private String description;

    /**
     * Optionale ID eines bestehenden Reifegradmodells, das mit diesem Katalog verknüpft werden soll.
     */
    private UUID reifegradModelId;

    public CreateCatalogDTO() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getReifegradModelId() {
        return reifegradModelId;
    }

    public void setReifegradModelId(UUID reifegradModelId) {
        this.reifegradModelId = reifegradModelId;
    }
}
