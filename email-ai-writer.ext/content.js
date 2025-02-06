console.log("Email Writer Assistant - content loaded!");

function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.innerHTML = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI reply");
  return button;
}

function getEmailContent() {
  const selectors = [".h7", ".a3s.aiL", "gmail_quote", '[role="toolbar"]'];

  for (const selector of selectors) {
    const content = document.querySelector(selector); //      Check if the added nodes contain the compose elements
    if (content) {
      return content.innerText.trim();
    } //      Check if the added nodes contain the compose elements
  }
  return "";
}

function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];

  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      console.log("Toolbar found:", toolbar);
      return toolbar;
    }
  }
  console.warn("Toolbar not found");
  return null;
}

function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }
  console.log("Toolbar found, create AI button");
  const button = createAIButton();
  button.classList.add("ai-reply-button");

  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating...";
      button.disabled = true;

      const emailContent = getEmailContent();
      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional"
        })
      });

      if (!response.ok) {
        throw new Error(
          `API Request Failed: ${response.status} ${response.statusText}`
        );
      }

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textData = await response.text();
        data = { generatedReply: textData };
      }

      // ✅ Use alternative selectors for the Gmail compose box
      const composeBox = document.querySelector(
        '[role="textbox"], .editable, .Am.Al'
      );

      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, data.generatedReply);
        console.log("Generated reply inserted successfully.");
      } else {
        console.error(
          "❌ Compose box was not found. Please check the selectors."
        );
      }
    } catch (error) {
      alert("Failed to generate reply");
      console.error("Error:", error);
    } finally {
      button.innerHTML = "AI Reply";
      button.disabled = false;
    }
  });



  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  // Create a MutationObserver
  for (const mutation of mutations) {
    // Loop through the mutations
    const addedNodes = Array.from(mutation.addedNodes); // Get the added nodes
    const hasComposeElements = addedNodes.some(
      //      Check if the added nodes contain the compose elements
      (
        node //      Check if the added nodes contain the compose elements
      ) =>
        node.nodeType === Node.ELEMENT_NODE && //      Check if the added nodes contain the compose elements
        (node.matches('.aDh, .btC, [role="dialog"]') || //      Check if the added nodes contain the compose elements
          node.querySelector('.aDh, .btC, [role="dialog"]')) //      Check if the added nodes contain the compose elements
    );
    if (hasComposeElements) {
      //      Check if the added nodes contain the compose elements
      // Check if the added nodes contain the compose elements
      console.log("Compose Window Detected");
      setTimeout(injectButton, 500); //add a delay to ensure the compose window is fully loaded
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true }); // Observe the entire document
