# Code with AI — Android Integration Guide

## API Endpoint

**Base URL:** `https://hossain.dev/api/ai-code-chat`

**Method:** `POST`

**Content-Type:** `application/json`

---

## Request Format

```json
{
  "prompt": "Explain closures in JavaScript",
  "language": "javascript",
  "sessionId": "optional-session-uuid",
  "conversationHistory": [
    { "role": "user", "content": "What is a closure?" },
    { "role": "assistant", "content": "A closure is..." }
  ]
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ Yes | Your question about programming (max 2000 chars) |
| `language` | string | ❌ Optional | Primary programming language (e.g., "kotlin", "python", "typescript") |
| `sessionId` | string | ❌ Optional | Session UUID for tracking conversations (can be any unique ID) |
| `conversationHistory` | array | ❌ Optional | Previous messages in format `[{ role, content }, ...]` |

### Constraints

- **Topic Locked:** Only programming/coding questions accepted
- **Max Prompt Length:** 2,000 characters
- **Rate Limit:** 150 requests/day (AI Gateway limit)
- **Off-Topic Rejection:** Non-programming questions get a friendly redirect

---

## Response Format

**Content-Type:** `text/event-stream` (Server-Sent Events)

The response streams tokens in real-time:

```
data: {"choices":[{"delta":{"content":"A"}}]}
data: {"choices":[{"delta":{"content":" closure"}}]}
data: {"choices":[{"delta":{"content":" is"}}]}
...
data: [DONE]
```

### Response Examples

**Success (Programming Question):**
```
data: {"choices":[{"delta":{"content":"A"}}]}
data: {"choices":[{"delta":{"content":" closure"}}]}
data: {"choices":[{"delta":{"content":" is"}}]}
...
// Full response about closures streams in
```

**Rejection (Off-Topic):**
```
data: {"choices":[{"delta":{"content":"I"}}]}
data: {"choices":[{"delta":{"content":" can"}}]}
data: {"choices":[{"delta":{"content":" only"}}]}
data: {"choices":[{"delta":{"content":" help"}}]}
data: {"choices":[{"delta":{"content":" with"}}]}
data: {"choices":[{"delta":{"content":" programming"}}]}
data: {"choices":[{"delta":{"content":" topics"}}]}
...
```

**Error Response (JSON):**
```json
{
  "error": "Missing required field: prompt"
}
```

---

## Supported Topics

✓ **Languages:** JavaScript, Python, Kotlin, Java, C++, Go, Rust, C#, PHP, Swift, Ruby, Scala, Haskell, etc.

✓ **Web Dev:** React, Vue, Angular, Node.js, Express, FastAPI, Django, Spring, etc.

✓ **Mobile:** Android, iOS, Flutter, React Native, Jetpack Compose, etc.

✓ **Backend:** Databases (SQL, NoSQL), APIs (REST, GraphQL), Microservices, Message Queues

✓ **DevOps:** Docker, Kubernetes, CI/CD, GitHub Actions, Terraform, AWS, GCP

✓ **Concepts:** Algorithms, Design Patterns, SOLID Principles, Async/Await, Concurrency

✓ **Tools:** Git, Command Line, IDEs, Build Systems, Testing Frameworks

---

## Android Implementation (Kotlin)

### Dependencies

Add to `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:okhttp-sse:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
}
```

### Data Classes

```kotlin
data class CodeChatRequest(
    val prompt: String,
    val language: String? = null,
    val sessionId: String? = null,
    val conversationHistory: List<Message>? = null
)

data class Message(
    val role: String,  // "user" or "assistant"
    val content: String
)

data class CodeChatResponse(
    val error: String? = null,
    val token: String? = null
)
```

### Service Class

```kotlin
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class CodeAIService {
    private val client = OkHttpClient()
    private val gson = Gson()
    private val baseUrl = "https://hossain.dev/api/ai-code-chat"

    suspend fun chat(
        prompt: String,
        language: String? = null,
        sessionId: String? = null,
        conversationHistory: List<Message>? = null,
        onToken: (String) -> Unit,
        onError: (String) -> Unit,
        onComplete: () -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            // Build request
            val request = CodeChatRequest(
                prompt = prompt,
                language = language,
                sessionId = sessionId,
                conversationHistory = conversationHistory
            )

            val jsonBody = gson.toJson(request)
            val requestBody = jsonBody.toRequestBody("application/json".toMediaType())

            val httpRequest = Request.Builder()
                .url(baseUrl)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .build()

            // Execute with SSE support
            client.newCall(httpRequest).execute().use { response ->
                if (!response.isSuccessful) {
                    val errorBody = response.body?.string() ?: "Unknown error"
                    val error = try {
                        gson.fromJson(errorBody, CodeChatResponse::class.java)
                    } catch (e: Exception) {
                        CodeChatResponse(error = "HTTP ${response.code}")
                    }
                    onError(error.error ?: "Request failed")
                    return@withContext
                }

                // Stream tokens
                response.body?.byteStream()?.bufferedReader().use { reader ->
                    reader?.forEachLine { line ->
                        if (line.startsWith("data: ")) {
                            val jsonData = line.substring(6).trim()
                            if (jsonData == "[DONE]") {
                                onComplete()
                                return@forEachLine
                            }

                            try {
                                val parsed = gson.fromJson(jsonData, Map::class.java)

                                // Extract token (handle multiple formats)
                                val token = when {
                                    parsed.containsKey("choices") -> {
                                        val choices = parsed["choices"] as? List<*>
                                        val choice = choices?.firstOrNull() as? Map<*, *>
                                        val delta = choice?.get("delta") as? Map<*, *>
                                        delta?.get("content") as? String
                                    }
                                    parsed.containsKey("response") ->
                                        parsed["response"] as? String

                                    parsed.containsKey("text") ->
                                        parsed["text"] as? String

                                    else -> null
                                }

                                token?.let { onToken(it) }
                            } catch (e: Exception) {
                                // Skip malformed lines
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            onError(e.message ?: "Unknown error occurred")
        }
    }
}
```

### Usage in Activity/ViewModel

```kotlin
class CodeAIChatViewModel : ViewModel() {
    private val service = CodeAIService()
    private val _messages = mutableListOf<Message>()
    val messages: List<Message> get() = _messages

    private val _responseText = MutableLiveData("")
    val responseText: LiveData<String> = _responseText

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData("")
    val error: LiveData<String> = _error

    fun sendQuestion(
        prompt: String,
        language: String? = "kotlin"
    ) = viewModelScope.launch {
        _isLoading.value = true
        _error.value = ""
        _responseText.value = ""

        // Add user message to history
        _messages.add(Message(role = "user", content = prompt))

        service.chat(
            prompt = prompt,
            language = language,
            conversationHistory = _messages.dropLast(1),  // Exclude current user message for context
            onToken = { token ->
                _responseText.value = (_responseText.value ?: "") + token
            },
            onError = { error ->
                _error.value = error
                _isLoading.value = false
            },
            onComplete = {
                // Add assistant response to history
                _messages.add(
                    Message(
                        role = "assistant",
                        content = _responseText.value ?: ""
                    )
                )
                _isLoading.value = false
            }
        )
    }

    fun clearSession() {
        _messages.clear()
        _responseText.value = ""
        _error.value = ""
    }
}
```

### UI Usage (Compose)

```kotlin
@Composable
fun CodeAIChatScreen(viewModel: CodeAIChatViewModel) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Message history
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            items(viewModel.messages) { message ->
                MessageBubble(message)
            }
        }

        // Error message
        if (viewModel.error.value?.isNotEmpty() == true) {
            Text(
                text = viewModel.error.value ?: "",
                color = Color.Red,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            )
        }

        // Current response (streaming)
        if (viewModel.responseText.value?.isNotEmpty() == true) {
            ResponseBubble(
                text = viewModel.responseText.value ?: "",
                isStreaming = viewModel.isLoading.value == true
            )
        }

        // Input field
        Row(modifier = Modifier.fillMaxWidth()) {
            var input by remember { mutableStateOf("") }

            TextField(
                value = input,
                onValueChange = { input = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Ask about code...") },
                enabled = !viewModel.isLoading.value!!
            )

            Button(
                onClick = {
                    viewModel.sendQuestion(input)
                    input = ""
                },
                enabled = input.isNotEmpty() && !viewModel.isLoading.value!!
            ) {
                Text("Send")
            }
        }

        // Loading indicator
        if (viewModel.isLoading.value == true) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }
}

@Composable
fun MessageBubble(message: Message) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = if (message.role == "user")
            Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .background(
                    color = if (message.role == "user") Color.Blue else Color.Gray,
                    shape = RoundedCornerShape(12.dp)
                )
        ) {
            Text(
                text = message.content,
                color = Color.White,
                modifier = Modifier.padding(12.dp)
            )
        }
    }
}

@Composable
fun ResponseBubble(text: String, isStreaming: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = text)
            if (isStreaming) {
                Text(
                    text = "●",  // Cursor
                    modifier = Modifier.animateContentSize()
                )
            }
        }
    }
}
```

---

## Session Management

Save conversation history to local database for later review:

```kotlin
@Entity
data class ChatSession(
    @PrimaryKey val id: String,
    val topic: String,
    val language: String,
    val createdAt: Long,
    val messages: String  // JSON serialized
)

// Save session
fun saveSession(messages: List<Message>, language: String) {
    val session = ChatSession(
        id = UUID.randomUUID().toString(),
        topic = messages.first().content.take(50),
        language = language,
        createdAt = System.currentTimeMillis(),
        messages = gson.toJson(messages)
    )
    database.sessionDao().insert(session)
}

// Load and resume session
fun resumeSession(sessionId: String) {
    val session = database.sessionDao().getSession(sessionId)
    val messages: List<Message> = gson.fromJson(
        session.messages,
        object : TypeToken<List<Message>>() {}.type
    )
    viewModel.messages.addAll(messages)
}
```

---

## Error Handling

### Common Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | `Invalid JSON body` | Malformed request |
| 400 | `Missing required field: prompt` | Prompt is empty |
| 400 | `Prompt exceeds 2000 character limit` | Prompt too long |
| 429 | `Daily learning limit reached` | Rate limited (try tomorrow) |
| 500 | `AI inference failed` | Server-side AI error |

### Retry Strategy

```kotlin
suspend fun chatWithRetry(
    prompt: String,
    maxRetries: Int = 3,
    backoffMs: Long = 1000
) {
    var lastError: Exception? = null

    repeat(maxRetries) { attempt ->
        try {
            service.chat(
                prompt = prompt,
                onToken = { /* ... */ },
                onError = { throw Exception(it) },
                onComplete = { return@repeat }
            )
        } catch (e: Exception) {
            lastError = e
            if (attempt < maxRetries - 1) {
                delay(backoffMs * (attempt + 1))  // Exponential backoff
            }
        }
    }

    lastError?.let { throw it }
}
```

---

## Best Practices

1. **Cache Responses:** Store frequently asked questions locally to reduce API calls
2. **Display Markdown:** Parse code blocks with syntax highlighting
3. **Track Sessions:** Save conversation history for learning review
4. **Offline Support:** Queue questions when offline, send when connection restored
5. **User Feedback:** Show loading state, error handling, token streaming animation
6. **Rate Limit Awareness:** Show "daily limit reached" message gracefully

---

## Testing

### Sample Requests

**Test Programming Question:**
```bash
curl -X POST https://hossain.dev/api/ai-code-chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain async/await in Kotlin",
    "language": "kotlin"
  }'
```

**Test Multi-Turn Conversation:**
```bash
curl -X POST https://hossain.dev/api/ai-code-chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "How do I handle errors?",
    "language": "kotlin",
    "conversationHistory": [
      { "role": "user", "content": "What is a coroutine?" },
      { "role": "assistant", "content": "A coroutine is..." }
    ]
  }'
```

**Test Off-Topic (Should Reject):**
```bash
curl -X POST https://hossain.dev/api/ai-code-chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France?"
  }'
```

---

## Rate Limiting

- **Limit:** 150 requests/day per user
- **Window:** Rolling 24-hour window
- **When Hit:** Returns HTTP 429 with message "Daily learning limit reached. Please try again tomorrow."
- **For Production:** Consider adding per-user API keys and higher limits

---

## Support

**Endpoint Status:** Live at `https://hossain.dev/api/ai-code-chat`

**Questions?** Check [AI_SUMMARY_FEATURE_ANALYSIS.md](../AI_SUMMARY_FEATURE_ANALYSIS.md) for backend architecture details.
