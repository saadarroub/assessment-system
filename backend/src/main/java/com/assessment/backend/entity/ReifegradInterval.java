package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "reifegrad_intervals")
public class ReifegradInterval {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "model_id", nullable = false)
    private ReifegradModel model;

    @Column(nullable = false)
    private Integer fromPercent;

    @Column(nullable = false)
    private Integer toPercent;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private Integer sortOrder;

    public ReifegradInterval() {}

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public ReifegradModel getModel() { return model; }

    public void setModel(ReifegradModel model) { this.model = model; }

    public Integer getFromPercent() { return fromPercent; }

    public void setFromPercent(Integer fromPercent) { this.fromPercent = fromPercent; }

    public Integer getToPercent() { return toPercent; }

    public void setToPercent(Integer toPercent) { this.toPercent = toPercent; }

    public String getLabel() { return label; }

    public void setLabel(String label) { this.label = label; }

    public Integer getSortOrder() { return sortOrder; }

    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
