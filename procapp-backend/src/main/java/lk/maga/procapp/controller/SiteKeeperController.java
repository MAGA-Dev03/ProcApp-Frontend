package lk.maga.procapp.controller;

import lk.maga.procapp.dto.InvoiceResponse;
import lk.maga.procapp.dto.PageResponse;
import lk.maga.procapp.security.RoleNames;
import lk.maga.procapp.service.InvoiceService;
import lk.maga.procapp.service.InvoiceStatusService;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/site-keeper")
@PreAuthorize("hasAnyRole('" + RoleNames.SITE_STORE_KEEPER + "')")

public class SiteKeeperController {

    private final InvoiceService invoiceService;
    private final InvoiceStatusService statusService;

    public SiteKeeperController(InvoiceService invoiceService, InvoiceStatusService statusService) {
        this.invoiceService = invoiceService;
        this.statusService = statusService;
    }

    @GetMapping("/invoices")
    public PageResponse<InvoiceResponse> list(
            @RequestParam(required = false) Long projectId,
            Authentication authentication,
            Pageable pageable
    ) {
        Long userId = (Long) authentication.getPrincipal();
        var page = invoiceService.listForSiteKeeper(userId, projectId, pageable);
        return PageResponse.from(page, inv -> new InvoiceResponse(inv, statusService));
    }        
            
}
