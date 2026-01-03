# Student Exam System - Frontend Next.js Implementation Guide

## Base URL & Authentication
```
Base URL: http://localhost:8386
Headers: Authorization: Bearer <student-jwt-token>
```

## Core Flow
1. **View Available Exams** → 2. **Start Exam** → 3. **Take Exam** → 4. **Submit** → 5. **View Result**

---

## 1. Get Available Exams

### API
```http
GET /api/exams/available
```

### Response
```json
[
  {
    "id": "exam-uuid",
    "title": "Midterm Java Programming",
    "className": "IT001.01",
    "subjectName": "Java Programming",
    "startTime": "2024-12-30T09:00:00",
    "endTime": "2024-12-30T12:00:00", 
    "durationMinutes": 120,
    "totalQuestions": 25,
    "maxAttempts": 1,
    "remainingAttempts": 1,
    "canTakeExam": true,
    "isActive": true,
    "isTimeUp": false
  }
]
```

---

## 2. Check Exam Eligibility

### API
```http
GET /api/exams/{examId}/can-take
```

### Response
```json
true
```

---

## 3. Start Exam

### API
```http
POST /api/exams/{examId}/start
```

### Request
```json
{
  "browserName": "Chrome",
  "browserVersion": "120.0.0.0",
  "operatingSystem": "Windows 11",
  "screenResolution": "1920x1080",
  "timezone": "Asia/Ho_Chi_Minh",
  "deviceType": "desktop",
  "isFullScreen": true,
  "academicIntegrityAcknowledged": true,
  "rulesAcknowledged": true
}
```

### Response
```json
{
  "attemptId": "attempt-uuid",
  "examId": "exam-uuid",
  "examTitle": "Midterm Java Programming",
  "startedAt": "2024-12-30T09:05:00",
  "remainingTimeSeconds": 7200,
  "durationMinutes": 120,
  "questions": [
    {
      "questionId": "q1-uuid",
      "questionType": "MCQ",
      "questionText": "What is encapsulation in Java?",
      "orderIndex": 1,
      "points": 1.0,
      "options": [
        {
          "optionId": "opt1-uuid",
          "optionText": "Data hiding",
          "orderIndex": 1
        },
        {
          "optionId": "opt2-uuid", 
          "optionText": "Inheritance",
          "orderIndex": 2
        }
      ]
    },
    {
      "questionId": "q2-uuid",
      "questionType": "TRUE_FALSE",
      "questionText": "Java is platform independent",
      "orderIndex": 2,
      "points": 1.0,
      "options": [
        {
          "optionId": "true-uuid",
          "optionText": "True",
          "orderIndex": 1
        },
        {
          "optionId": "false-uuid",
          "optionText": "False", 
          "orderIndex": 2
        }
      ]
    }
  ]
}
```

---

## 4. Submit Exam

### API
```http
POST /api/exams/{examId}/submit
```

### Request
```json
{
  "attemptId": "attempt-uuid",
  "isAutoSubmit": false,
  "timeSpentSeconds": 7200,
  "answers": [
    {
      "questionId": "q1-uuid",
      "answerData": {
        "selectedOptionId": "opt1-uuid"
      },
      "timeSpentSeconds": 120,
      "revisionCount": 1,
      "wasSkipped": false,
      "confidence": "HIGH"
    },
    {
      "questionId": "q2-uuid", 
      "answerData": {
        "selectedOptionId": "true-uuid"
      },
      "timeSpentSeconds": 60,
      "revisionCount": 0,
      "wasSkipped": false,
      "confidence": "MEDIUM"
    }
  ],
  "tabSwitchCount": 0,
  "copyPasteCount": 0,
  "rightClickCount": 0
}
```

### Response
```json
{
  "attemptId": "attempt-uuid",
  "examTitle": "Midterm Java Programming",
  "status": "GRADED",
  "totalScore": 18.5,
  "totalPossibleScore": 25.0,
  "percentageScore": 74.0,
  "isPassed": true,
  "grade": "B",
  "totalQuestions": 25,
  "correctAnswers": 18,
  "incorrectAnswers": 5,
  "skippedQuestions": 2,
  "timeSpentFormatted": "1h 45m 30s"
}
```

---

## 5. Get Exam Result

### API
```http
GET /api/exams/{examId}/result
```

### Response
Same as submit response above.

---

## Frontend Implementation Notes

### State Management
```javascript
const [availableExams, setAvailableExams] = useState([]);
const [currentExam, setCurrentExam] = useState(null);
const [answers, setAnswers] = useState({});
const [timeRemaining, setTimeRemaining] = useState(0);
const [examResult, setExamResult] = useState(null);
```

### Key Functions
```javascript
// 1. Load available exams
const fetchAvailableExams = async () => {
  const response = await fetch('/api/exams/available');
  return response.json();
};

// 2. Start exam
const startExam = async (examId, browserInfo) => {
  const response = await fetch(`/api/exams/${examId}/start`, {
    method: 'POST',
    body: JSON.stringify(browserInfo)
  });
  return response.json();
};

// 3. Submit exam
const submitExam = async (examId, submitData) => {
  const response = await fetch(`/api/exams/${examId}/submit`, {
    method: 'POST', 
    body: JSON.stringify(submitData)
  });
  return response.json();
};
```

### Answer Data Structure
- **MCQ**: `{"selectedOptionId": "option-uuid"}`
- **TRUE_FALSE**: `{"selectedOptionId": "true-uuid" | "false-uuid"}`
- **ESSAY**: `{"essayText": "student answer text"}`

### Timer Implementation
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        // Auto submit when time up
        handleAutoSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

### Error Handling
- **403**: Not authorized to take exam
- **409**: Exam already taken or time up
- **400**: Invalid submission data

### Security Features
- Disable right-click, copy-paste
- Track tab switches
- Fullscreen mode enforcement
- Auto-submit on time up

---

## Pages Structure
1. **ExamList** - Show available exams
2. **ExamStart** - Pre-exam instructions & start
3. **ExamTaking** - Main exam interface
4. **ExamResult** - Show results after submission

Backend handles all validation, grading, and security. Frontend focuses on UI/UX and data collection.