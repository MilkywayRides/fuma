# Blog Post Template

Use this template as a reference for creating rich blog posts with markdown, code, and math.

## Text Formatting

**Bold text** and *italic text* and ***bold italic***

~~Strikethrough text~~

## Headers

# H1 Header
## H2 Header
### H3 Header
#### H4 Header

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Links and Images

[Link text](https://example.com)

![Image alt text](https://via.placeholder.com/400x200)

## Code Blocks

### Inline Code
Use `const variable = value;` for inline code.

### JavaScript Code Block
```js
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome ${name}`;
}

greet('World');
```

### Python Code Block
```python
def calculate_sum(a, b):
    """Calculate sum of two numbers"""
    return a + b

result = calculate_sum(5, 3)
print(f"Result: {result}")
```

### TypeScript Code Block
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
```

### Bash/Shell Commands
```bash
npm install package-name
cd /path/to/directory
ls -la
```

## Math Equations

### Inline Math
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

Einstein's famous equation: $E = mc^2$

### Math Blocks

```math
\int_{a}^{b} f(x) dx = F(b) - F(a)
```

```math
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
```

```math
\begin{aligned}
x^2 + y^2 &= z^2 \\
a^2 + b^2 &= c^2
\end{aligned}
```

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.

> **Note:** Important information goes here!

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |
| Row 3    | Data     | More     |

## Horizontal Rule

---

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Combining Elements

### Code with Explanation

Here's how to solve a quadratic equation:

```python
import math

def solve_quadratic(a, b, c):
    discriminant = b**2 - 4*a*c
    
    if discriminant > 0:
        x1 = (-b + math.sqrt(discriminant)) / (2*a)
        x2 = (-b - math.sqrt(discriminant)) / (2*a)
        return (x1, x2)
    elif discriminant == 0:
        x = -b / (2*a)
        return (x,)
    else:
        return None  # No real solutions

# Example: x^2 - 5x + 6 = 0
solutions = solve_quadratic(1, -5, 6)
print(f"Solutions: {solutions}")  # Output: (3.0, 2.0)
```

The discriminant formula is: $\Delta = b^2 - 4ac$

### Math Problem Example

**Problem:** Find the derivative of $f(x) = 3x^3 - 2x^2 + 5x - 1$

**Solution:**

Using the power rule: $\frac{d}{dx}[x^n] = nx^{n-1}$

```math
f'(x) = 3 \cdot 3x^2 - 2 \cdot 2x + 5 \cdot 1 - 0 = 9x^2 - 4x + 5
```

**Answer:** $f'(x) = 9x^2 - 4x + 5$

## Tips for Great Blog Posts

1. **Use clear headings** - Organize content with H2 and H3 headers
2. **Add code examples** - Show practical implementations
3. **Include visuals** - Images and diagrams help explain concepts
4. **Write clear explanations** - Break down complex topics
5. **Use math notation** - For technical or scientific content
6. **Format code properly** - Specify the language for syntax highlighting
7. **Add blockquotes** - Highlight important notes or quotes
8. **Keep it readable** - Use short paragraphs and bullet points
