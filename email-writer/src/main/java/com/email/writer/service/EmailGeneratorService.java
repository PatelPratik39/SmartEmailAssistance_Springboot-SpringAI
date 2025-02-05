package com.email.writer.service;

import com.email.writer.app.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Value("${gemini.api.url}")
    private String geminiUrl;

    @Value("${gemini.api.key}")
    private  String geminiApiKey;

    public String generateEmailReply(EmailRequest emailRequest) {

        // ** Validate Email Input **
        String sanitizedEmail = sanitizeInput(emailRequest.getEmailContent());
        if (sanitizedEmail.isBlank()) {
            return "⚠️ Error: Email content is required for generating a reply.";
        }
        // ** Build Secure Prompt **
//        String prompt = buildPrompt(new EmailRequest(sanitizedEmail, emailRequest.getTone()));


//        Build the Prompt -> gemini api
//        String prompt = buildPrompt(emailRequest);
        String prompt = buildPrompt(new EmailRequest(sanitizedEmail, emailRequest.getTone()));

//        craft the request like this :
        /**
         {
            "contents": [{
                "parts": [
                {
                    "text": "Your prompt goes here or Question"
                }]
            }]
        }
         *
         */
        Map<String, Object> requestBody =  Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                            Map.of("text", prompt)
                        })
                }
        );
//        Do request and get response
    try{
        String response = webClient.post()
                .uri(geminiUrl+geminiApiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10)) // Prevent long hangs
                .block();

//       Extract response and Return
        return extractResponseContent(response);
    } catch (WebClientResponseException e) {
        return "⚠️ API Error: Unable to generate email reply. Please try again later.";
    } catch (Exception e) {
        return "⚠️ Internal Error: " + e.getMessage();
    }
    }

    private String extractResponseContent(String response) {
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);

            // ** Ensure response structure is valid **
            JsonNode candidatesNode = rootNode.path("candidates");
            if (candidatesNode.isMissingNode() || candidatesNode.isEmpty()) {
                return "⚠️ Error: No valid response received from AI.";
            }

            return rootNode
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }catch(Exception e){
            return  "Error processing request : " + e.getMessage();
        }
    }

//    build prompt

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please do not generate a subject line ");
        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone for the email content. ");
        }

        prompt.append("Ensure the reply has: a polite greeting, clear response, and a professional closing. ");
        prompt.append("Avoid including any sensitive information like personal details. ");

        prompt.append("\nOriginal email : \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

//    Sanitize the input
    private String sanitizeInput(String input) {
        if (input == null || input.isBlank()) return "";

        // ** Remove any sensitive PII like emails, phone numbers, etc. **
        input = input.replaceAll("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+", "[redacted-email]");
        input = input.replaceAll("\\b\\d{10}\\b", "[redacted-phone]");

        // ** Ensure input does not contain malicious content **
        input = input.replaceAll(Pattern.quote("<script>"), "[blocked]");

        // ** Trim and limit excessive length **
        return input.length() > 1000 ? input.substring(0, 1000) + "..." : input;
    }
}
