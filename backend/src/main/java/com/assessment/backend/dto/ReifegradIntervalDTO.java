package com.assessment.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO für ein einzelnes Reifegrad-Intervall.
 * Wird als JSON-Array im JSONB-Feld der ReifegradModel-Entity gespeichert.
 */
public class ReifegradIntervalDTO {

    @NotBlank(message = "Intervall-Name darf nicht leer sein")
    private String name;

    @NotNull(message = "Startwert ist erforderlich")
    @Min(value = 0, message = "Startwert muss mindestens 0 sein")
    @Max(value = 100, message = "Startwert darf maximal 100 sein")
    private Integer start;

    @NotNull(message = "Endwert ist erforderlich")
    @Min(value = 0, message = "Endwert muss mindestens 0 sein")
    @Max(value = 100, message = "Endwert darf maximal 100 sein")
    private Integer end;

    private String color; // Hex-Farbe für das Intervall, z.B. "#22c55e"

    public ReifegradIntervalDTO() {}

    public ReifegradIntervalDTO(String name, Integer start, Integer end) {
        this.name = name;
        this.start = start;
        this.end = end;
    }

    public ReifegradIntervalDTO(String name, Integer start, Integer end, String color) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.color = color;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return end;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
