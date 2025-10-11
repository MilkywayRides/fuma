'use client';

import { useState } from 'react';
import { Copy, Check, Code, Key, Database, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DeveloperPage() {
  const [copied, setCopied] = useState('');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

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
          headers: { Authorization: 'Bearer {token}' },
          body: { postId: 'number', content: 'string', parentId: 'number | null' },
          response: { id: 'number', content: 'string', authorName: 'string' },
        },
        {
          method: 'POST',
          path: '/api/comments/{id}/like',
          description: 'Like/unlike comment',
          headers: { Authorization: 'Bearer {token}' },
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
        <p className="text-muted-foreground">API documentation for mobile and external integrations</p>
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
            <h2 className="text-xl font-semibold">Authentication Flow</h2>
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

                    {endpoint.headers && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Headers:</p>
                        <div className="relative">
                          <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                            <code>{JSON.stringify(endpoint.headers, null, 2)}</code>
                          </pre>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.headers, null, 2), `headers-${idx}-${endpointIdx}`)}
                            className="absolute top-2 right-2 p-1.5 hover:bg-accent rounded"
                          >
                            {copied === `headers-${idx}-${endpointIdx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {endpoint.body && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Request Body:</p>
                        <div className="relative">
                          <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                            <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                          </pre>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.body, null, 2), `body-${idx}-${endpointIdx}`)}
                            className="absolute top-2 right-2 p-1.5 hover:bg-accent rounded"
                          >
                            {copied === `body-${idx}-${endpointIdx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Response:</p>
                      <div className="relative">
                        <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                          <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2), `response-${idx}-${endpointIdx}`)}
                          className="absolute top-2 right-2 p-1.5 hover:bg-accent rounded"
                        >
                          {copied === `response-${idx}-${endpointIdx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
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
        
        <Tabs defaultValue="react-native" className="p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="react-native">React Native</TabsTrigger>
            <TabsTrigger value="java">Java/Android</TabsTrigger>
            <TabsTrigger value="ios">iOS/Swift</TabsTrigger>
          </TabsList>
          
          <TabsContent value="react-native" className="mt-4">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                <code>{`// Install: npm install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sign In
const signIn = async (email, password) => {
  const response = await fetch('${baseUrl}/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  await AsyncStorage.setItem('token', data.session.token);
  return data.user;
};

// Fetch Posts
const getPosts = async () => {
  const response = await fetch('${baseUrl}/api/posts');
  return await response.json();
};

// Create Comment (Authenticated)
const createComment = async (postId, content) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch('${baseUrl}/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({ postId, content })
  });
  return await response.json();
};`}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(`// Install: npm install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sign In
const signIn = async (email, password) => {
  const response = await fetch('${baseUrl}/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  await AsyncStorage.setItem('token', data.session.token);
  return data.user;
};

// Fetch Posts
const getPosts = async () => {
  const response = await fetch('${baseUrl}/api/posts');
  return await response.json();
};

// Create Comment (Authenticated)
const createComment = async (postId, content) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch('${baseUrl}/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({ postId, content })
  });
  return await response.json();
};`, 'code-react-native')}
                className="absolute top-2 right-2 p-2 hover:bg-accent rounded-md transition-colors"
              >
                {copied === 'code-react-native' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="java" className="mt-4">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                <code>{`// Add OkHttp dependency to build.gradle
import okhttp3.*;
import org.json.JSONObject;

public class ApiClient {
    private static final String BASE_URL = "${baseUrl}";
    private OkHttpClient client = new OkHttpClient();
    
    // Sign In
    public JSONObject signIn(String email, String password) throws Exception {
        JSONObject json = new JSONObject();
        json.put("email", email);
        json.put("password", password);
        
        RequestBody body = RequestBody.create(
            json.toString(),
            MediaType.parse("application/json")
        );
        
        Request request = new Request.Builder()
            .url(BASE_URL + "/api/auth/sign-in")
            .post(body)
            .build();
            
        Response response = client.newCall(request).execute();
        String responseData = response.body().string();
        JSONObject data = new JSONObject(responseData);
        
        // Store token in SharedPreferences
        String token = data.getJSONObject("session").getString("token");
        SharedPreferences prefs = context.getSharedPreferences("app", MODE_PRIVATE);
        prefs.edit().putString("token", token).apply();
        
        return data.getJSONObject("user");
    }
    
    // Fetch Posts
    public JSONArray getPosts() throws Exception {
        Request request = new Request.Builder()
            .url(BASE_URL + "/api/posts")
            .get()
            .build();
            
        Response response = client.newCall(request).execute();
        return new JSONArray(response.body().string());
    }
}`}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(`// Add OkHttp dependency to build.gradle
import okhttp3.*;
import org.json.JSONObject;

public class ApiClient {
    private static final String BASE_URL = "${baseUrl}";
    private OkHttpClient client = new OkHttpClient();
    
    // Sign In
    public JSONObject signIn(String email, String password) throws Exception {
        JSONObject json = new JSONObject();
        json.put("email", email);
        json.put("password", password);
        
        RequestBody body = RequestBody.create(
            json.toString(),
            MediaType.parse("application/json")
        );
        
        Request request = new Request.Builder()
            .url(BASE_URL + "/api/auth/sign-in")
            .post(body)
            .build();
            
        Response response = client.newCall(request).execute();
        String responseData = response.body().string();
        JSONObject data = new JSONObject(responseData);
        
        // Store token in SharedPreferences
        String token = data.getJSONObject("session").getString("token");
        SharedPreferences prefs = context.getSharedPreferences("app", MODE_PRIVATE);
        prefs.edit().putString("token", token).apply();
        
        return data.getJSONObject("user");
    }
    
    // Fetch Posts
    public JSONArray getPosts() throws Exception {
        Request request = new Request.Builder()
            .url(BASE_URL + "/api/posts")
            .get()
            .build();
            
        Response response = client.newCall(request).execute();
        return new JSONArray(response.body().string());
    }
}`, 'code-java')}
                className="absolute top-2 right-2 p-2 hover:bg-accent rounded-md transition-colors"
              >
                {copied === 'code-java' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="ios" className="mt-4">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                <code>{`import Foundation

class ApiClient {
    let baseURL = "${baseUrl}"
    
    // Sign In
    func signIn(email: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        let url = URL(string: "\(baseURL)/api/auth/sign-in")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let session = json["session"] as? [String: Any],
               let token = session["token"] as? String {
                // Store token in UserDefaults
                UserDefaults.standard.set(token, forKey: "token")
                
                if let userData = json["user"] as? [String: Any] {
                    // Parse user data
                    completion(.success(User(from: userData)))
                }
            }
        }.resume()
    }
    
    // Fetch Posts
    func getPosts(completion: @escaping (Result<[Post], Error>) -> Void) {
        let url = URL(string: "\(baseURL)/api/posts")!
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data else { return }
            
            if let posts = try? JSONDecoder().decode([Post].self, from: data) {
                completion(.success(posts))
            }
        }.resume()
    }
    
    // Create Comment (Authenticated)
    func createComment(postId: Int, content: String, completion: @escaping (Result<Comment, Error>) -> Void) {
        let url = URL(string: "\(baseURL)/api/comments")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = UserDefaults.standard.string(forKey: "token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let body = ["postId": postId, "content": content] as [String : Any]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            
            if let comment = try? JSONDecoder().decode(Comment.self, from: data) {
                completion(.success(comment))
            }
        }.resume()
    }
}`}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(`import Foundation

class ApiClient {
    let baseURL = "${baseUrl}"
    
    // Sign In
    func signIn(email: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        let url = URL(string: "\(baseURL)/api/auth/sign-in")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let session = json["session"] as? [String: Any],
               let token = session["token"] as? String {
                // Store token in UserDefaults
                UserDefaults.standard.set(token, forKey: "token")
                
                if let userData = json["user"] as? [String: Any] {
                    // Parse user data
                    completion(.success(User(from: userData)))
                }
            }
        }.resume()
    }
    
    // Fetch Posts
    func getPosts(completion: @escaping (Result<[Post], Error>) -> Void) {
        let url = URL(string: "\(baseURL)/api/posts")!
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data else { return }
            
            if let posts = try? JSONDecoder().decode([Post].self, from: data) {
                completion(.success(posts))
            }
        }.resume()
    }
    
    // Create Comment (Authenticated)
    func createComment(postId: Int, content: String, completion: @escaping (Result<Comment, Error>) -> Void) {
        let url = URL(string: "\(baseURL)/api/comments")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = UserDefaults.standard.string(forKey: "token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let body = ["postId": postId, "content": content] as [String : Any]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            
            if let comment = try? JSONDecoder().decode(Comment.self, from: data) {
                completion(.success(comment))
            }
        }.resume()
    }
}`, 'code-ios')}
                className="absolute top-2 right-2 p-2 hover:bg-accent rounded-md transition-colors"
              >
                {copied === 'code-ios' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </TabsContent>
        </Tabs>
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
