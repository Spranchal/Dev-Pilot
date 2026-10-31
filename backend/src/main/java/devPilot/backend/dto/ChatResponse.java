package devPilot.backend.dto;

import java.util.List;

public record ChatResponse(
    String reply,
    List<CitationDto> citations
) {}

