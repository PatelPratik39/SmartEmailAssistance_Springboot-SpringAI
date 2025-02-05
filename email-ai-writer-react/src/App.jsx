import "./App.css";
import axios from "axios";
import { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from "@mui/material";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to redact personal information (PII) before sending
  const redactPII = (text) => {
    if (!text) return "";
    return text
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[redacted-email]") // Redact email addresses
      .replace(/\b\d{10,15}\b/g, "[redacted-phone]") // Redact phone numbers
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[redacted-name]"); // Redact full names
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `http://localhost:8080/api/email/generate`,
        { emailContent, tone }
      );
      setGeneratedReply(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data)
      );
    } catch (error) {
      setError("❌ Failed to generate Email Reply. Please try again. ❌");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI-Powered Email Reply Generator
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Paste an email below, choose a tone, and get an instant AI-generated reply.
        </Typography>
        <Box sx={{ mx: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            label="Paste email content here..."
            placeholder="Dear [redacted-name], I'm reaching out regarding..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tone of the Reply</InputLabel>
            <Select
              value={tone}
              label="Tone of the Reply"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!emailContent || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Generate Reply"}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {generatedReply && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI-Generated Reply:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              variant="outlined"
              value={generatedReply}
              inputProps={{ readOnly: true }}
            />
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigator.clipboard.writeText(generatedReply)}
            >
              Copy to Clipboard
            </Button>
          </Box>
        )}
      </Container>
    </>
   
   
  );
}

export default App;

{/* <Container maxWidth="md" sx={{ py: 4 }}>
  <Typography variant="h4" component="h1" gutterBottom>
    AI Email reply Generator
  </Typography>
  <Box sx={{ mx: 3 }}>
    <TextField
      fullWidth
      multiline
      rows={10}
      variant="outlined"
      label="Email Content....."
      value={emailContent || ""}
      onChange={(e) => setEmailContent(e.target.value)}
      sx={{ mb: 2 }}
    />
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Tone (Optional)</InputLabel>
      <Select
        value={tone || ""}
        label={"Tone (Optional)"}
        onChange={(e) => setTone(e.target.value)}
      >
        <MenuItem value="">None</MenuItem>
        <MenuItem value="professional">Professional</MenuItem>
        <MenuItem value="casual">Casual</MenuItem>
        <MenuItem value="friendly">Friendly</MenuItem>
      </Select>
    </FormControl>

    <Button
      variant="contained"
      onClick={handleSubmit}
      disabled={!emailContent || loading}
      fullWidth
    >
      {loading ? <CircularProgress size={24} /> : "Generate Reply"}
    </Button>
  </Box>
  {error && (
    <Typography color="error" sx={{ mt: 2 }}>
      {error}
    </Typography>
  )}
  {genratedReply && (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Generated Reply :{" "}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        variant="outlined"
        value={genratedReply || " "}
        inputProps={{ readOnly: true }}
      />
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => navigator.clipboard.writeText(genratedReply)}
      >
        Copy to Clipboard
      </Button>
    </Box>
  )}
</Container> */}