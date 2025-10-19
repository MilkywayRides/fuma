# Example Flow Scripts

Here are some example flows to help you get started with the flow scripting system.

## Example 1: Simple Data Processing

**Purpose**: Process and transform input data

**Nodes**:
1. **Start Node** (Input)
   - Title: "Receive Data"
   - Content: "Entry point for data"

2. **Process Node** (Default)
   - Title: "Transform Data"
   - Content: "Apply business logic"
   - Code (if using Python node):
   ```python
   data = inputs.get('data', {})
   output = {
       'processed': True,
       'result': data.get('value', 0) * 2
   }
   ```

3. **End Node** (Output)
   - Title: "Return Result"
   - Content: "Output processed data"

**Connections**: Start → Process → End

---

## Example 2: API Integration Flow

**Purpose**: Fetch data from external API and process it

**Nodes**:
1. **Start Node**
   - Title: "Trigger"
   - Content: "Start API flow"

2. **HTTP Request Node**
   - Title: "Fetch User Data"
   - Type: HTTP
   - URL: `https://jsonplaceholder.typicode.com/users/1`
   - Method: GET

3. **Process Node**
   - Title: "Extract Name"
   - Code:
   ```python
   response = inputs.get('http_response', {})
   user_data = response.get('data', {})
   output = {
       'name': user_data.get('name', 'Unknown'),
       'email': user_data.get('email', 'Unknown')
   }
   ```

4. **End Node**
   - Title: "Complete"
   - Content: "Flow finished"

**Connections**: Start → HTTP → Process → End

---

## Example 3: Conditional Processing

**Purpose**: Process data differently based on conditions

**Nodes**:
1. **Start Node**
   - Title: "Input"
   - Content: "Receive request"

2. **Process Node** (Validator)
   - Title: "Validate Input"
   - Code:
   ```python
   data = inputs.get('data', {})
   value = data.get('value', 0)
   output = {
       'valid': value > 0,
       'value': value
   }
   ```

3. **Process Node** (Success Path)
   - Title: "Process Valid Data"
   - Code:
   ```python
   validation = inputs.get('validation', {})
   if validation.get('valid'):
       output = {'status': 'success', 'result': validation.get('value') * 10}
   else:
       output = {'status': 'skipped'}
   ```

4. **Process Node** (Error Path)
   - Title: "Handle Invalid Data"
   - Code:
   ```python
   validation = inputs.get('validation', {})
   if not validation.get('valid'):
       output = {'status': 'error', 'message': 'Invalid input'}
   else:
       output = {'status': 'skipped'}
   ```

5. **End Node**
   - Title: "Complete"
   - Content: "Flow finished"

**Connections**: 
- Start → Validator
- Validator → Success Path → End
- Validator → Error Path → End

---

## Example 4: Data Aggregation

**Purpose**: Collect data from multiple sources

**Nodes**:
1. **Start Node**
   - Title: "Initialize"
   - Content: "Start aggregation"

2. **HTTP Request Node** (Source 1)
   - Title: "Fetch Posts"
   - URL: `https://jsonplaceholder.typicode.com/posts/1`
   - Method: GET

3. **HTTP Request Node** (Source 2)
   - Title: "Fetch Comments"
   - URL: `https://jsonplaceholder.typicode.com/comments/1`
   - Method: GET

4. **Process Node**
   - Title: "Combine Data"
   - Code:
   ```python
   posts = inputs.get('posts', {})
   comments = inputs.get('comments', {})
   output = {
       'post': posts.get('data', {}),
       'comment': comments.get('data', {}),
       'combined': True
   }
   ```

5. **End Node**
   - Title: "Output"
   - Content: "Return combined data"

**Connections**: 
- Start → Fetch Posts → Combine
- Start → Fetch Comments → Combine
- Combine → End

---

## Example 5: Data Transformation Pipeline

**Purpose**: Multi-step data transformation

**Nodes**:
1. **Start Node**
   - Title: "Raw Data"
   - Content: "Input raw data"

2. **Process Node** (Step 1)
   - Title: "Clean Data"
   - Code:
   ```python
   data = inputs.get('data', {})
   output = {
       'cleaned': True,
       'value': str(data.get('value', '')).strip().lower()
   }
   ```

3. **Process Node** (Step 2)
   - Title: "Validate Data"
   - Code:
   ```python
   cleaned = inputs.get('cleaned_data', {})
   value = cleaned.get('value', '')
   output = {
       'valid': len(value) > 0,
       'value': value
   }
   ```

4. **Process Node** (Step 3)
   - Title: "Format Data"
   - Code:
   ```python
   validated = inputs.get('validated_data', {})
   if validated.get('valid'):
       output = {
           'formatted': validated.get('value').upper(),
           'timestamp': 'now'
       }
   else:
       output = {'error': 'Invalid data'}
   ```

5. **End Node**
   - Title: "Final Output"
   - Content: "Return formatted data"

**Connections**: Start → Clean → Validate → Format → End

---

## Example 6: Webhook Handler

**Purpose**: Process incoming webhook data

**Nodes**:
1. **Start Node**
   - Title: "Webhook Received"
   - Content: "Incoming webhook"

2. **Process Node** (Parser)
   - Title: "Parse Payload"
   - Code:
   ```python
   webhook = inputs.get('webhook', {})
   output = {
       'event': webhook.get('event', 'unknown'),
       'data': webhook.get('data', {}),
       'timestamp': webhook.get('timestamp', 'now')
   }
   ```

3. **Process Node** (Handler)
   - Title: "Handle Event"
   - Code:
   ```python
   parsed = inputs.get('parsed', {})
   event = parsed.get('event')
   
   if event == 'user.created':
       output = {'action': 'send_welcome_email'}
   elif event == 'user.deleted':
       output = {'action': 'cleanup_data'}
   else:
       output = {'action': 'log_event'}
   ```

4. **HTTP Request Node**
   - Title: "Send Notification"
   - URL: `https://api.example.com/notify`
   - Method: POST
   - Body: `{"message": "Event processed"}`

5. **End Node**
   - Title: "Complete"
   - Content: "Webhook processed"

**Connections**: Start → Parser → Handler → Notification → End

---

## Tips for Creating Flows

### Best Practices

1. **Start Simple**
   - Begin with 3-4 nodes
   - Test frequently
   - Add complexity gradually

2. **Name Nodes Clearly**
   - Use descriptive titles
   - Add helpful content descriptions
   - Make flows self-documenting

3. **Handle Errors**
   - Add validation nodes
   - Include error handling paths
   - Log important information

4. **Test Incrementally**
   - Save as draft while building
   - Test each node individually
   - Publish only when complete

### Common Patterns

1. **Linear Flow**: Start → Process → End
2. **Branching**: Start → Validator → [Success/Error] → End
3. **Aggregation**: Multiple sources → Combine → End
4. **Pipeline**: Start → Step1 → Step2 → Step3 → End

### Node Connection Rules

- Each node can have multiple inputs
- Each node can have multiple outputs
- Avoid circular connections
- Ensure all paths lead to an end node

### Debugging Tips

1. **Check Execution Logs**
   - View Modal logs: `modal app logs flow-executor`
   - Check database execution records

2. **Simplify Complex Flows**
   - Break into smaller flows
   - Test components separately
   - Combine when working

3. **Use Console Output**
   - Add print statements in Python nodes
   - Log intermediate values
   - Track data flow

## Next Steps

1. Try creating one of these example flows
2. Modify them to fit your use case
3. Combine patterns to create complex workflows
4. Share your flows with the team

Happy flow building! 🚀
