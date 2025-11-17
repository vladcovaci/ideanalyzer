/**
 * Test script to verify OpenAI Deep Research API access
 * Run with: npx tsx test-deep-research-access.ts
 */

import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testDeepResearchAccess() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY not found in environment");
    process.exit(1);
  }

  console.log("✓ API key found (length:", apiKey.length, ")");

  const client = new OpenAI({
    apiKey,
    timeout: 60000, // 60 second timeout for initial request
    maxRetries: 0,
  });

  console.log("\n--- Testing Deep Research API Access ---\n");

  try {
    console.log("Attempting to create Deep Research request...");
    console.log("Model: o4-mini-deep-research-2025-06-26");

    const response = await client.responses.create({
      model: "o4-mini-deep-research-2025-06-26",
      input: [
        {
          role: "developer",
          content: [{ type: "input_text", text: "Provide a brief summary of this topic." }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: "What is the current state of AI?" }],
        },
      ],
      tools: [{ type: "web_search_preview" }],
      reasoning: { summary: "auto" },
    });

    console.log("\n✅ SUCCESS! Your API key has access to Deep Research.");
    console.log("Response ID:", response.id);
    console.log("Status:", response.status);
    console.log("\nYour API key is working correctly!");

  } catch (error: unknown) {
    console.error("\n❌ FAILED - Error details:\n");

    const err = error as { status?: number; code?: string; message?: string; type?: string };

    if (err.status) {
      console.error("HTTP Status:", err.status);
    }

    if (err.code) {
      console.error("Error Code:", err.code);
    }

    if (err.message) {
      console.error("Message:", err.message);
    }

    if (err.type) {
      console.error("Type:", err.type);
    }

    // Specific error interpretations
    if (err.status === 401) {
      console.error("\n💡 This is an authentication error. Your API key might be invalid.");
    } else if (err.status === 403) {
      console.error("\n💡 This is a permission error. Your API key doesn't have access to Deep Research.");
      console.error("   You may need to upgrade your OpenAI plan or request access.");
    } else if (err.status === 404) {
      console.error("\n💡 The model or endpoint was not found.");
      console.error("   Deep Research might not be available in your region or tier.");
    } else if (err.message?.includes("timeout")) {
      console.error("\n💡 The request timed out. This could indicate a network issue.");
    } else {
      console.error("\n💡 Unknown error. Full error object:");
      console.error(JSON.stringify(err, null, 2));
    }

    process.exit(1);
  }
}

testDeepResearchAccess();
