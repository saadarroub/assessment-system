package com.assessment.backend.controller;

import com.assessment.backend.entity.Thema;
import com.assessment.backend.service.ThemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/themas")
@CrossOrigin(origins = "*")
public class  ThemaController {

    @Autowired
    private ThemaService themaService;

    // Create - POST /api/themas
    @PostMapping
    public ResponseEntity<Thema> createThema(@RequestBody Thema thema) {
        try {
            Thema createdThema = themaService.createThema(thema);
            return new ResponseEntity<>(createdThema, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read All - GET /api/themas
    @GetMapping
    public ResponseEntity<List<Thema>> getAllThemas() {
        try {
            List<Thema> themas = themaService.getAllThemas();
            if (themas.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By ID - GET /api/themas/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Thema> getThemaById(@PathVariable("id") UUID id) {
        try {
            Optional<Thema> thema = themaService.getThemaById(id);
            return thema.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Read By Name - GET /api/themas/name/{name}
    @GetMapping("/name/{name}")
    public ResponseEntity<Thema> getThemaByName(@PathVariable("name") String name) {
        try {
            Optional<Thema> thema = themaService.getThemaByName(name);
            return thema.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

  //Read By the Active Status
  @GetMapping("/status/active")
  public ResponseEntity<List<Thema>> getThemasByActiveStatus() {
    try {
      List<Thema> themen = themaService.getActiveStatus();
      if (themen.isEmpty()) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      return new ResponseEntity<>(themen, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Read By the Inactive Status
  @GetMapping("/status/inactive")
  public ResponseEntity<List<Thema>> getThemasByInactiveStatus() {
    try {
      List<Thema> themen = themaService.getInactiveStatus();
      if (themen.isEmpty()) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      return new ResponseEntity<>(themen, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Change the current Status
  @PatchMapping("/status/change/{id}")
  public ResponseEntity<Thema> changeStatusById(@PathVariable("id") UUID id) {
    try {
      Thema changedStatus = themaService.changeStatus(id);
      return new ResponseEntity<>(changedStatus, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  //Deactivate All
  @PatchMapping("/status/deactivate")
  public ResponseEntity<List<Thema>> deactivateAll(){
      try{
        List<Thema> deactivatedThemas = themaService.deactivateAll();
        return new ResponseEntity<>(deactivatedThemas, HttpStatus.OK);
      } catch (RuntimeException e) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      } catch (Exception e) {
        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      }


    // Search By Name - GET /api/themas/search?name=xyz
    @GetMapping("/search")
    public ResponseEntity<List<Thema>> searchThemasByName(@RequestParam("name") String name) {
        try {
            List<Thema> themas = themaService.searchThemasByName(name);
            if (themas.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(themas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update - PUT /api/themas/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Thema> updateThema(@PathVariable("id") UUID id, @RequestBody Thema thema) {
        try {
            Thema updatedThema = themaService.updateThema(id, thema);
            return new ResponseEntity<>(updatedThema, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete - DELETE /api/themas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteThema(@PathVariable("id") UUID id) {
        try {
            themaService.deleteThema(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete All - DELETE /api/themas
    @DeleteMapping
    public ResponseEntity<HttpStatus> deleteAllThemas() {
        try {
            themaService.getAllThemas().forEach(thema -> themaService.deleteThema(thema.getId()));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count - GET /api/themas/count
    @GetMapping("/count")
    public ResponseEntity<Long> countThemas() {
        try {
            long count = themaService.count();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check Exists by ID - GET /api/themas/exists/{id}
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> themaExistsById(@PathVariable("id") UUID id) {
        try {
            boolean exists = themaService.existsById(id);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check Exists by Name - GET /api/themas/exists/name/{name}
    @GetMapping("/exists/name/{name}")
    public ResponseEntity<Boolean> themaExistsByName(@PathVariable("name") String name) {
        try {
            boolean exists = themaService.existsByName(name);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Duplicate Thema - POST /api/themas/{id}/duplicate
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Thema> duplicateThema(@PathVariable("id") UUID id) {
        try {
            Thema duplicatedThema = themaService.duplicateThema(id);
            return new ResponseEntity<>(duplicatedThema, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
