package com.optivise.dto;
public class CreateAbTestRequest {
    private String name, elementType, variantALabel, variantBLabel;
    public CreateAbTestRequest() {}
    public String getName() { return name; } public void setName(String v) { name = v; }
    public String getElementType() { return elementType; } public void setElementType(String v) { elementType = v; }
    public String getVariantALabel() { return variantALabel; } public void setVariantALabel(String v) { variantALabel = v; }
    public String getVariantBLabel() { return variantBLabel; } public void setVariantBLabel(String v) { variantBLabel = v; }
}
