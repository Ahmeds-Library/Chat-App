
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Send, MessageCircle, Database, Wifi } from 'lucide-react';

export const WebSocketFlowExplanation: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="w-5 h-5" />
            <span>WebSocket Message Flow Explanation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sender ID Source */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span>1. Sender ID کا Source</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Primary Source</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    <code>currentUserNumber</code> prop سے جو Chat page پر pass ہوتا ہے
                  </p>
                  <Badge variant="secondary" className="mt-2">user.number</Badge>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Fallback Source</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    JWT Token سے decode کرکے <code>apiClient.getCurrentUserNumber()</code>
                  </p>
                  <Badge variant="secondary" className="mt-2">JWT Token</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Receiver ID Source */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">2. Receiver ID کا Source</h3>
            <Card className="bg-purple-50 dark:bg-purple-900/20">
              <CardContent className="p-4">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <code>selectedUser.number</code> سے جو user نے chat list سے select کیا ہے
                </p>
                <Badge variant="secondary" className="mt-2">selectedUser.number</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Message Flow */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">3. Message Flow Process</h3>
            <div className="space-y-4">
              {/* Sending Flow */}
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Message Sending (REST API)</span>
                  </h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge>1</Badge>
                      <span>User types message اور Send button press کرتا ہے</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>2</Badge>
                      <span>Frontend optimistic message add کرتا ہے (instant UI update)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>3</Badge>
                      <span>REST API call: <code>POST /message</code></span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>4</Badge>
                      <span>Backend database میں message save کرتا ہے</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>5</Badge>
                      <span>Backend WebSocket سے receiver کو message broadcast کرتا ہے</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Receiving Flow */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Receiving (WebSocket)</span>
                  </h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge>1</Badge>
                      <span>WebSocket connection active رہتا ہے: <code>ws://localhost:9000/ws?token=JWT</code></span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>2</Badge>
                      <span>Backend سے real-time message آتا ہے</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>3</Badge>
                      <span>Message format transform ہوتا ہے: backend format → frontend format</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>4</Badge>
                      <span>Relevance check: message current conversation کے لیے ہے یا نہیں</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <Badge>5</Badge>
                      <span>Duplicate check اور UI update</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Message Format Transformation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">4. Message Format Transformation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-200">Backend WebSocket Format</h4>
                  <pre className="text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded mt-2 overflow-x-auto">
{`{
  "id": "msg_123",
  "sender_id": "03001234567",
  "receiver_id": "03009876543", 
  "message": "Hello there!",
  "created_at": "2024-01-01T10:00:00Z",
  "type": "chat"
}`}
                  </pre>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Frontend Message Format</h4>
                  <pre className="text-xs bg-green-100 dark:bg-green-900/40 p-2 rounded mt-2 overflow-x-auto">
{`{
  "id": "msg_123",
  "sender": "03001234567",
  "receiver": "03009876543",
  "content": "Hello there!",
  "timestamp": "2024-01-01T10:00:00Z",
  "status": "delivered"
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Connection Health */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">5. Connection Health Monitoring</h3>
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Ping-Pong</Badge>
                    <span>ہر 30 سیکنڈ میں ping بھیجتا ہے connection check کرنے کے لیے</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Auto-Reconnect</Badge>
                    <span>Connection fail ہونے پر automatically reconnect کرتا ہے</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Status Updates</Badge>
                    <span>UI میں real-time connection status show کرتا ہے</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
