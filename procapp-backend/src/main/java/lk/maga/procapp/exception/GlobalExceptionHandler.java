package lk.maga.procapp.exception;

import lk.maga.procapp.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

@ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
public ResponseEntity<ApiError> handleValidation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
    Map<String, String> fieldErrors = new java.util.HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(fe ->
            fieldErrors.put(fe.getField(), fe.getDefaultMessage())
    );
         ApiError error = new ApiError("Validation failed", 422, fieldErrors);
        return ResponseEntity.status(422).body(error);
    }
  
  @ExceptionHandler(lk.maga.procapp.exception.ValidationException.class)
    public ResponseEntity<ApiError> handleValidation(lk.maga.procapp.exception.ValidationException ex) {
        ApiError error = new ApiError("Validation failed", 422, ex.getFieldErrors());
        return ResponseEntity.status(422).body(error);
    }  
}