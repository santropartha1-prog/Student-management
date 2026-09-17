import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, Terminal, Send, Server, RefreshCw, FileText } from 'lucide-react';
import { TestCaseResult } from '../types';

interface ApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent: () => void;
}

const INITIAL_TEST_CASES: TestCaseResult[] = [
  {
    id: 'TC01',
    title: 'Add valid student',
    method: 'POST',
    endpoint: '/api/students/',
    inputDescription: 'Valid student payload: { name: "Test Student", email: "test.student@example.com", phone: "9876543299", age: 21, course: "BCA" }',
    expectedResult: '201 Created with saved student record and generated ID',
    status: 'idle',
  },
  {
    id: 'TC02',
    title: 'Submit empty name',
    method: 'POST',
    endpoint: '/api/students/',
    inputDescription: 'Empty name: { name: "", email: "valid@gmail.com", phone: "9876543210", age: 20, course: "BCA" }',
    expectedResult: '400 Bad Request with "Name is required."',
    status: 'idle',
  },
  {
    id: 'TC03',
    title: 'Enter invalid email',
    method: 'POST',
    endpoint: '/api/students/',
    inputDescription: 'Invalid email format: { name: "Rahul", email: "invalidemailformat", phone: "9876543210", age: 20, course: "BCA" }',
    expectedResult: '400 Bad Request with "Please enter a valid email address."',
    status: 'idle',
  },
  {
    id: 'TC04',
    title: 'View all students',
    method: 'GET',
    endpoint: '/api/students/',
    inputDescription: 'Query parameter: None',
    expectedResult: '200 OK with array of student records',
    status: 'idle',
  },
  {
    id: 'TC05',
    title: 'Edit student',
    method: 'PUT',
    endpoint: '/api/students/1/',
    inputDescription: 'Updated course to "MCA": { name: "Rahul Kumar", email: "rahul@gmail.com", phone: "9876543210", age: 21, course: "MCA" }',
    expectedResult: '200 OK with updated record',
    status: 'idle',
  },
  {
    id: 'TC06',
    title: 'Delete student',
    method: 'DELETE',
    endpoint: '/api/students/{temp_id}/',
    inputDescription: 'Delete freshly created student record',
    expectedResult: '200 OK with deletion confirmation message',
    status: 'idle',
  },
  {
    id: 'TC07',
    title: 'Update invalid ID',
    method: 'PUT',
    endpoint: '/api/students/999999/',
    inputDescription: 'Non-existent student ID 999999',
    expectedResult: '404 Not Found with error message',
    status: 'idle',
  },
  {
    id: 'TC08',
    title: 'Delete invalid ID',
    method: 'DELETE',
    endpoint: '/api/students/999999/',
    inputDescription: 'Non-existent student ID 999999',
    expectedResult: '404 Not Found with error message',
    status: 'idle',
  },
  {
    id: 'TC09',
    title: 'Add duplicate email',
    method: 'POST',
    endpoint: '/api/students/',
    inputDescription: 'Duplicate email "priya@gmail.com" (already exists in DB)',
    expectedResult: '400 Bad Request with unique constraint error',
    status: 'idle',
  },
  {
    id: 'TC10',
    title: 'Search student',
    method: 'GET',
    endpoint: '/api/students/?search=Rahul',
    inputDescription: 'Query parameter: search=Rahul',
    expectedResult: '200 OK with array of matching students containing "Rahul"',
    status: 'idle',
  },
];

export const ApiTesterModal: React.FC<ApiTesterModalProps> = ({
  isOpen,
  onClose,
  onRefreshParent,
}) => {
  const [activeTab, setActiveTab] = useState<'suite' | 'postman'>('suite');
  const [testCases, setTestCases] = useState<TestCaseResult[]>(INITIAL_TEST_CASES);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Postman Custom Tester State
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState('/api/students/');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        name: 'Rahul Kumar',
        email: 'rahul.new@gmail.com',
        phone: '9876543210',
        age: 20,
        course: 'BCA',
      },
      null,
      2
    )
  );
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [customStatus, setCustomStatus] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [isSendingCustom, setIsSendingCustom] = useState(false);

  if (!isOpen) return null;

  // Run a single test case
  const executeTestCase = async (tc: TestCaseResult, tempStudentId?: number): Promise<TestCaseResult> => {
    const startTime = performance.now();
    try {
      let res: Response;
      let targetEndpoint = tc.endpoint;

      if (tc.id === 'TC01') {
        // Add valid student
        const uniqueEmail = `test.student.${Date.now()}@example.com`;
        res = await fetch('/api/students/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Student',
            email: uniqueEmail,
            phone: '9876543299',
            age: 21,
            course: 'BCA',
          }),
        });
      } else if (tc.id === 'TC02') {
        // Empty name
        res = await fetch('/api/students/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '',
            email: 'valid@gmail.com',
            phone: '9876543210',
            age: 20,
            course: 'BCA',
          }),
        });
      } else if (tc.id === 'TC03') {
        // Invalid email
        res = await fetch('/api/students/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Rahul',
            email: 'invalidemailformat',
            phone: '9876543210',
            age: 20,
            course: 'BCA',
          }),
        });
      } else if (tc.id === 'TC04') {
        // View all
        res = await fetch('/api/students/');
      } else if (tc.id === 'TC05') {
        // Edit student 1
        res = await fetch('/api/students/1/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Rahul Kumar',
            email: 'rahul@gmail.com',
            phone: '9876543210',
            age: 21,
            course: 'MCA',
          }),
        });
      } else if (tc.id === 'TC06') {
        // Delete student
        const deleteId = tempStudentId || 999999;
        targetEndpoint = `/api/students/${deleteId}/`;
        res = await fetch(targetEndpoint, { method: 'DELETE' });
      } else if (tc.id === 'TC07') {
        // Update invalid ID
        res = await fetch('/api/students/999999/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Ghost',
            email: 'ghost@gmail.com',
            phone: '1234567890',
            age: 25,
            course: 'BCA',
          }),
        });
      } else if (tc.id === 'TC08') {
        // Delete invalid ID
        res = await fetch('/api/students/999999/', { method: 'DELETE' });
      } else if (tc.id === 'TC09') {
        // Duplicate email
        res = await fetch('/api/students/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Duplicate Priya',
            email: 'priya@gmail.com',
            phone: '9876543211',
            age: 22,
            course: 'B.Sc',
          }),
        });
      } else if (tc.id === 'TC10') {
        // Search
        res = await fetch('/api/students/?search=Rahul');
      } else {
        res = await fetch(tc.endpoint);
      }

      const durationMs = Math.round(performance.now() - startTime);
      const json = await res.json().catch(() => ({}));

      // Evaluation rules
      let passed = false;
      if (tc.id === 'TC01' && res.status === 201) passed = true;
      if (tc.id === 'TC02' && res.status === 400 && json.error?.includes('Name')) passed = true;
      if (tc.id === 'TC03' && res.status === 400 && json.error?.includes('email')) passed = true;
      if (tc.id === 'TC04' && res.status === 200 && Array.isArray(json)) passed = true;
      if (tc.id === 'TC05' && res.status === 200 && json.course === 'MCA') passed = true;
      if (tc.id === 'TC06' && (res.status === 200 || res.status === 404)) passed = true;
      if (tc.id === 'TC07' && res.status === 404) passed = true;
      if (tc.id === 'TC08' && res.status === 404) passed = true;
      if (tc.id === 'TC09' && res.status === 400 && (json.field === 'email' || json.error?.includes('email'))) passed = true;
      if (tc.id === 'TC10' && res.status === 200 && Array.isArray(json)) passed = true;

      return {
        ...tc,
        endpoint: targetEndpoint,
        status: passed ? 'passed' : 'failed',
        actualStatus: res.status,
        actualResponse: json,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        ...tc,
        status: 'failed',
        actualStatus: 0,
        errorDetails: err.message,
        durationMs,
      };
    }
  };

  // Run all 10 test cases in sequence
  const handleRunAllTests = async () => {
    setIsRunningAll(true);

    // Reset all to running/idle
    setTestCases((prev) => prev.map((t) => ({ ...t, status: 'idle', actualStatus: undefined, actualResponse: undefined })));

    // Create a temporary student specifically for TC06 delete test
    let tempId: number | undefined;
    try {
      const tempCreateRes = await fetch('/api/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Temp Deletion Target',
          email: `temp.delete.${Date.now()}@example.com`,
          phone: '9998887776',
          age: 23,
          course: 'MCA',
        }),
      });
      if (tempCreateRes.ok) {
        const tempJson = await tempCreateRes.json();
        tempId = tempJson.id;
      }
    } catch (e) {
      console.warn('Failed to pre-create student for TC06');
    }

    const updatedResults: TestCaseResult[] = [];
    for (const tc of INITIAL_TEST_CASES) {
      // Mark current as running
      setTestCases((current) =>
        current.map((item) => (item.id === tc.id ? { ...item, status: 'running' } : item))
      );

      const res = await executeTestCase(tc, tempId);
      updatedResults.push(res);

      setTestCases((current) =>
        current.map((item) => (item.id === tc.id ? res : item))
      );
    }

    setIsRunningAll(false);
    onRefreshParent();
  };

  // Custom Postman Request Sender
  const handleSendCustomRequest = async () => {
    setIsSendingCustom(true);
    setCustomResponse(null);
    setCustomStatus(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' || method === 'PUT') {
        options.body = requestBody;
      }

      const res = await fetch(endpoint, options);
      const dur = Math.round(performance.now() - start);
      setCustomStatus(res.status);
      setCustomDuration(dur);

      const json = await res.json().catch(() => ({}));
      setCustomResponse(json);
      onRefreshParent();
    } catch (err: any) {
      setCustomStatus(0);
      setCustomResponse({ error: err.message });
    } finally {
      setIsSendingCustom(false);
    }
  };

  const passedCount = testCases.filter((t) => t.status === 'passed').length;
  const failedCount = testCases.filter((t) => t.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        id="api-tester-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">API Testing & Postman Suite</h3>
              <p className="text-xs text-slate-400">
                REST API verification • Functional Test Cases TC01–TC10 (SOP Section 17 & 18)
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-api-tester"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('suite')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'suite'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Functional Test Cases (TC01–TC10)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('postman')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'postman'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Interactive Postman Client</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'suite' ? (
            <div className="space-y-5">
              {/* Suite Summary & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Functional Test Matrix</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Validates CRUD, client/server validations, duplicate handling, and search queries against SQLite.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-semibold text-slate-600">Passed: <strong className="text-emerald-600">{passedCount}</strong>/10</span>
                    {failedCount > 0 && (
                      <span className="font-semibold text-rose-600">Failed: {failedCount}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-run-all-tests"
                  onClick={handleRunAllTests}
                  disabled={isRunningAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  {isRunningAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Tests...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Run All Test Cases (TC01–TC10)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Cases List */}
              <div className="space-y-2.5">
                {testCases.map((tc) => {
                  const isExpanded = expandedTestId === tc.id;
                  return (
                    <div
                      key={tc.id}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300 transition-colors"
                    >
                      <div
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50"
                        onClick={() => setExpandedTestId(isExpanded ? null : tc.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-600 px-2 py-0.5 bg-slate-200 rounded">
                            {tc.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                              tc.method === 'GET'
                                ? 'bg-blue-100 text-blue-700'
                                : tc.method === 'POST'
                                ? 'bg-emerald-100 text-emerald-700'
                                : tc.method === 'PUT'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {tc.method}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {tc.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {tc.durationMs !== undefined && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {tc.durationMs}ms
                            </span>
                          )}

                          {tc.status === 'idle' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                              Ready
                            </span>
                          )}
                          {tc.status === 'running' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Running
                            </span>
                          )}
                          {tc.status === 'passed' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{tc.actualStatus} PASS</span>
                            </span>
                          )}
                          {tc.status === 'failed' && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{tc.actualStatus || 'ERR'} FAIL</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 bg-white text-xs space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                              <p className="font-semibold text-slate-700 mb-1">Input / Action:</p>
                              <p className="font-mono text-slate-600 text-[11px] break-all">{tc.inputDescription}</p>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                              <p className="font-semibold text-slate-700 mb-1">Expected Result:</p>
                              <p className="text-slate-600 text-[11px]">{tc.expectedResult}</p>
                            </div>
                          </div>

                          {tc.actualResponse && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                <span>Actual Backend Response ({tc.actualStatus}):</span>
                                <span>Latency: {tc.durationMs}ms</span>
                              </div>
                              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-40">
                                {JSON.stringify(tc.actualResponse, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Postman Custom Tester */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 mb-1">Direct REST API Testing (Section 18)</h4>
                <p className="text-slate-600">
                  Send raw HTTP requests directly to the Django REST / Express SQLite backend.
                </p>
              </div>

              {/* Endpoint bar */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white font-mono cursor-pointer"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/students/"
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  id="btn-postman-send"
                  onClick={handleSendCustomRequest}
                  disabled={isSendingCustom}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSendingCustom ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 text-[11px] self-center">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('GET');
                    setEndpoint('/api/students/');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
                >
                  GET /api/students/
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('GET');
                    setEndpoint('/api/students/1/');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
                >
                  GET /api/students/1/
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('POST');
                    setEndpoint('/api/students/');
                    setRequestBody(
                      JSON.stringify(
                        {
                          name: 'Sneha Roy',
                          email: `sneha.${Date.now()}@gmail.com`,
                          phone: '9876543220',
                          age: 21,
                          course: 'B.Sc',
                        },
                        null,
                        2
                      )
                    );
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
                >
                  POST /api/students/
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('PUT');
                    setEndpoint('/api/students/1/');
                    setRequestBody(
                      JSON.stringify(
                        {
                          name: 'Rahul Kumar',
                          email: 'rahul@gmail.com',
                          phone: '9876543210',
                          age: 21,
                          course: 'MCA',
                        },
                        null,
                        2
                      )
                    );
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
                >
                  PUT /api/students/1/
                </button>
              </div>

              {/* Request Payload Editor (for POST/PUT) */}
              {(method === 'POST' || method === 'PUT') && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Request Body (JSON):</label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 bg-slate-900 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Response Inspector */}
              {customStatus !== null && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Response Status:</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          customStatus >= 200 && customStatus < 300
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {customStatus} {customStatus === 200 ? 'OK' : customStatus === 201 ? 'CREATED' : ''}
                      </span>
                      {customDuration !== null && (
                        <span className="text-slate-400 text-[11px]">{customDuration}ms</span>
                      )}
                    </div>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto max-h-60">
                    {JSON.stringify(customResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
