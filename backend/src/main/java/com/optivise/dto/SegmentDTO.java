package com.optivise.dto;

public class SegmentDTO {
    private String name;
    private int value;   // percentage
    private int count;   // raw customer count

    public SegmentDTO() {}
    public SegmentDTO(String name, int value, int count) {
        this.name = name; this.value = value; this.count = count;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}