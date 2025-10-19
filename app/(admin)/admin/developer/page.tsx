'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Code, Key, Database, Smartphone, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { BundledLanguage } from '@/components/kibo-ui/code-block';
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from '@/components/kibo-ui/code-block';

export default function DeveloperPage() {
  const [copied, setCopied] = useState('');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    const res = await fetch('/api/api-keys');
    if (res.ok) setApiKeys(await res.json());
  };

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    });
    if (res.ok) {
      const data = await res.json();
      setNewKey(data.key);
      setNewKeyName('');
      fetchApiKeys();
    }
    setLoading(false);
  };

  const deleteKey = async (id: number) => {
    await fetch('/api/api-keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchApiKeys();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const endpoints = [
    {
      category: 'Authentication',
      icon: Key,
      items: [
        {
          method: 'POST',
          path: '/api/auth/sign-in',
          description: 'Sign in with email and password',
          body: { email: 'user@example.com', password: 'password' },
          response: { user: { id: 'string', name: 'string', email: 'string' }, session: { token: 'string' } },
        },
        {
          method: 'POST',
          path: '/api/auth/sign-up',
          description: 'Create new account',
          body: { name: 'string', email: 'user@example.com', password: 'password' },
          response: { user: { id: 'string', name: 'string', email: 'string' } },
        },
        {
          method: 'GET',
          path: '/api/auth/session',
          description: 'Get current user session',
          headers: { Authorization: 'Bearer {token}' },
          response: { user: { id: 'string', name: 'string', email: 'string', role: 'string' } },
        },
      ],
    },
    {
      category: 'Blog Posts',
      icon: Database,
      items: [
        {
          method: 'GET',
          path: '/api/posts',
          description: 'Get all published posts',
          response: [{ id: 'number', title: 'string', slug: 'string', content: 'string', excerpt: 'string' }],
        },
        {
          method: 'GET',
          path: '/api/posts/{slug}',
          description: 'Get single post by slug',
          response: { id: 'number', title: 'string', content: 'string', createdAt: 'date' },
        },
      ],
    },
    {
      category: 'Comments',
      icon: Database,
      items: [
        {
          method: 'POST',
          path: '/api/comments',
          description: 'Create comment',
          headers: { 'x-api-key': 'YOUR_API_KEY' },
          body: { postId: 'number', content: 'string', parentId: 'number | null' },
          response: { id: 'number', content: 'string', authorName: 'string' },
        },
        {
          method: 'POST',
          path: '/api/comments/{id}/like',
          description: 'Like/unlike comment',
          headers: { 'x-api-key': 'YOUR_API_KEY' },
          response: { success: true },
        },
      ],
    },
    {
      category: 'Flowcharts',
      icon: Database,
      items: [
        {
          method: 'GET',
          path: '/api/flowcharts',
          description: 'Get all flowcharts',
          response: [{ id: 'string', title: 'string', data: 'string', published: 'boolean' }],
        },
        {
          method: 'GET',
          path: '/api/flowcharts/{id}',
          description: 'Get single flowchart',
          response: { id: 'string', title: 'string', data: 'string' },
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer API</h1>
        <p className="text-muted-foreground">API documentation and key management</p>
      </div>

      <div className="border rounded-lg p-6 bg-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <h2 className="text-xl font-semibold">API Keys</h2>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" />Generate Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    placeholder="My Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button onClick={generateKey} disabled={loading} className="w-full">
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
                {newKey && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Your API Key (save it now!):</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs break-all">{newKey}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newKey, 'new-key')}>
                        {copied === 'new-key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {apiKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No API keys yet. Generate one to get started.</p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{key.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-muted-foreground">
                      {showKey[key.id] ? key.key : key.key}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {key.lastUsed ? `Last used: ${new Date(key.lastUsed).toLocaleDateString()}` : 'Never used'}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteKey(key.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Base URL</h2>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm">
            <code className="flex-1">{baseUrl}</code>
            <button
              onClick={() => copyToClipboard(baseUrl, 'base-url')}
              className="p-2 hover:bg-accent rounded"
            >
              {copied === 'base-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Authentication Methods</h2>
          </div>
          <div className="mb-4 p-3 bg-primary/10 rounded-md">
            <p className="text-sm font-medium mb-1">Using API Keys (Recommended)</p>
            <p className="text-xs text-muted-foreground">Add header: <code className="bg-background px-1 py-0.5 rounded">x-api-key: YOUR_API_KEY</code></p>
          </div>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
              <div>
                <p className="font-medium">Sign In / Sign Up</p>
                <p className="text-muted-foreground">POST to /api/auth/sign-in or /api/auth/sign-up</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
              <div>
                <p className="font-medium">Store Session Token</p>
                <p className="text-muted-foreground">Save the session token from response</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
              <div>
                <p className="font-medium">Use Token in Headers</p>
                <p className="text-muted-foreground">Add Authorization: Bearer {'{token}'} to protected requests</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div className="space-y-6">
        {endpoints.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/50 border-b">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-semibold">{category.category}</h3>
                </div>
              </div>
              <div className="divide-y">
                {category.items.map((endpoint, endpointIdx) => (
                  <div key={endpointIdx} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>

                    {'headers' in endpoint && endpoint.headers && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Headers:</p>
                        <JsonCodeBlock data={endpoint.headers} id={`headers-${idx}-${endpointIdx}`} />
                      </div>
                    )}

                    {'body' in endpoint && endpoint.body && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Request Body:</p>
                        <JsonCodeBlock data={endpoint.body} id={`body-${idx}-${endpointIdx}`} />
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Response:</p>
                      <JsonCodeBlock data={endpoint.response} id={`response-${idx}-${endpointIdx}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border rounded-lg overflow-hidden bg-card">
        <div className="flex items-center gap-2 p-4 border-b">
          <Code className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Code Examples</h2>
        </div>
        
        <div className="p-4">
          <CodeExamples baseUrl={baseUrl} />
        </div>
      </div>


      <div className="mt-8 border rounded-lg p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Web-Based Authentication for Mobile Apps</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Use this URL to open a web view in your mobile app for authentication. After successful login, the app will receive the session token.
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Authentication URL:</p>
            <div className="flex items-center gap-2 p-3 bg-background rounded-md font-mono text-sm">
              <code className="flex-1">{baseUrl}/auth/mobile?redirect=app://callback</code>
              <button
                onClick={() => copyToClipboard(`${baseUrl}/auth/mobile?redirect=app://callback`, 'auth-url')}
                className="p-2 hover:bg-accent rounded"
              >
                {copied === 'auth-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-medium">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open the authentication URL in a WebView/Browser</li>
              <li>User signs in through the web interface</li>
              <li>After successful login, redirects to: app://callback?token=SESSION_TOKEN</li>
              <li>Your app intercepts the redirect and extracts the token</li>
              <li>Store the token and use it for API requests</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

const JsonCodeBlock = ({ data, id }: { data: any; id: string }) => {
  const jsonString = JSON.stringify(data, null, 2);
  const codeData = [
    {
      language: 'json',
      filename: 'response.json',
      code: jsonString,
    },
  ];

  return (
    <CodeBlock data={codeData} defaultValue="json">
      <CodeBlockHeader>
        <CodeBlockFiles>
          {(item) => (
            <CodeBlockFilename key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockFilename>
          )}
        </CodeBlockFiles>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody>
        {(item) => (
          <CodeBlockItem key={item.language} value={item.language} lineNumbers={false}>
            <CodeBlockContent language={item.language as BundledLanguage}>
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
};

const CodeExamples = ({ baseUrl }: { baseUrl: string }) => {
  const codeData = [
    {
      language: 'javascript',
      filename: 'react-native.js',
      code: `// Install: npm install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'bn_your_api_key_here';

// Fetch Posts
const getPosts = async () => {
  const response = await fetch('${baseUrl}/api/posts');
  return await response.json();
};

// Create Comment (with API Key)
const createComment = async (postId, content) => {
  const response = await fetch('${baseUrl}/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({ postId, content })
  });
  return await response.json();
};

// Like Comment
const likeComment = async (commentId) => {
  const response = await fetch(\`${baseUrl}/api/comments/\${commentId}/like\`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY }
  });
  return await response.json();
};`,
    },
    {
      language: 'java',
      filename: 'ApiClient.java',
      code: `// Add OkHttp dependency to build.gradle
import okhttp3.*;
import org.json.JSONObject;

public class ApiClient {
    private static final String BASE_URL = "${baseUrl}";
    private static final String API_KEY = "bn_your_api_key_here";
    private OkHttpClient client = new OkHttpClient();
    
    // Fetch Posts
    public JSONArray getPosts() throws Exception {
        Request request = new Request.Builder()
            .url(BASE_URL + "/api/posts")
            .get()
            .build();
            
        Response response = client.newCall(request).execute();
        return new JSONArray(response.body().string());
    }
    
    // Create Comment
    public JSONObject createComment(int postId, String content) throws Exception {
        JSONObject json = new JSONObject();
        json.put("postId", postId);
        json.put("content", content);
        
        RequestBody body = RequestBody.create(
            json.toString(),
            MediaType.parse("application/json")
        );
        
        Request request = new Request.Builder()
            .url(BASE_URL + "/api/comments")
            .addHeader("x-api-key", API_KEY)
            .post(body)
            .build();
            
        Response response = client.newCall(request).execute();
        return new JSONObject(response.body().string());
    }
}`,
    },
    {
      language: 'swift',
      filename: 'ApiClient.swift',
      code: `import Foundation

class ApiClient {
    let baseURL = "${baseUrl}"
    let apiKey = "bn_your_api_key_here"
    
    // Fetch Posts
    func getPosts(completion: @escaping (Result<[Post], Error>) -> Void) {
        let url = URL(string: "\\(baseURL)/api/posts")!
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data else { return }
            
            if let posts = try? JSONDecoder().decode([Post].self, from: data) {
                completion(.success(posts))
            }
        }.resume()
    }
    
    // Create Comment
    func createComment(postId: Int, content: String, completion: @escaping (Result<Comment, Error>) -> Void) {
        let url = URL(string: "\\(baseURL)/api/comments")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        
        let body = ["postId": postId, "content": content] as [String : Any]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            
            if let comment = try? JSONDecoder().decode(Comment.self, from: data) {
                completion(.success(comment))
            }
        }.resume()
    }
}`,
    },
    {
      language: 'dart',
      filename: 'api_client.dart',
      code: `// Add http package: flutter pub add http
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  static const String baseURL = '${baseUrl}';
  static const String apiKey = 'bn_your_api_key_here';
  
  // Fetch Posts
  Future<List<dynamic>> getPosts() async {
    final response = await http.get(
      Uri.parse('\$baseURL/api/posts'),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load posts');
  }
  
  // Create Comment
  Future<Map<String, dynamic>> createComment(int postId, String content) async {
    final response = await http.post(
      Uri.parse('\$baseURL/api/comments'),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: json.encode({
        'postId': postId,
        'content': content,
      }),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create comment');
  }
  
  // Like Comment
  Future<Map<String, dynamic>> likeComment(int commentId) async {
    final response = await http.post(
      Uri.parse('\$baseURL/api/comments/\$commentId/like'),
      headers: {'x-api-key': apiKey},
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to like comment');
  }
}`,
    },
  ];

  return (
    <CodeBlock data={codeData} defaultValue={codeData[0].language}>
      <CodeBlockHeader>
        <CodeBlockFiles>
          {(item) => (
            <CodeBlockFilename key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockFilename>
          )}
        </CodeBlockFiles>
        <CodeBlockSelect>
          <CodeBlockSelectTrigger>
            <CodeBlockSelectValue />
          </CodeBlockSelectTrigger>
          <CodeBlockSelectContent>
            {(item) => (
              <CodeBlockSelectItem key={item.language} value={item.language}>
                {item.language}
              </CodeBlockSelectItem>
            )}
          </CodeBlockSelectContent>
        </CodeBlockSelect>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody>
        {(item) => (
          <CodeBlockItem key={item.language} value={item.language}>
            <CodeBlockContent language={item.language as BundledLanguage}>
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
};
