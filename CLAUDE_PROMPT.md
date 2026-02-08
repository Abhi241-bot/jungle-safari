# Jungle Safari Management System - Complete Implementation Prompt for Claude Sonnet 4.5

## 🎯 **PROJECT CONTEXT**

You are working on a **Zoo/Wildlife Management System** with a React frontend and Python Flask backend. The system has:
- **Zookeepers**: Submit daily observations via voice/text
- **Admins**: Manage users, inventory, view all logs
- **Vets**: Track animal health, hospital records
- **Forest Officers**: View reports and compliance

The project is undergoing a **MAJOR UPGRADE** to implement structured forms, enhanced logging, hospital records, messaging, and scheduling.

---

## 📂 **PROJECT STRUCTURE**

```
Junglesafari1-main/
├── src/
│   ├── components/
│   │   ├── EnhancedDailyLogEntry.tsx          ✅ COMPLETE
│   │   ├── ObservationQuestionsForm.tsx       ✅ COMPLETE
│   │   ├── AnimalHealthFormComponent.tsx      ✅ COMPLETE
│   │   ├── KraalHealthFormComponent.tsx       ✅ COMPLETE
│   │   ├── HospitalRecords.tsx                ✅ COMPLETE
│   │   ├── MessagingHub.tsx                   ✅ COMPLETE
│   │   ├── InventoryManagement.tsx            ⚠️ NEEDS FIX
│   │   ├── VetDashboard.tsx                   🔧 NEEDS UPDATE
│   │   ├── AdminDashboard.tsx                 🔧 NEEDS UPDATE
│   │   └── mockData.ts                        ✅ COMPLETE
│   ├── types/
│   │   └── index.ts                           ✅ COMPLETE
│   └── App.tsx                                ✅ COMPLETE
├── backend_api.py                             ❌ NEEDS MAJOR UPDATES
└── requirements.txt                           🔧 NEEDS UPDATES
```

---

## 🚀 **YOUR TASKS**

### **TASK 1: Fix Inventory Color Coding**
**File**: `src/components/InventoryManagement.tsx`

**Problem**: The file has Windows line endings (`\r\n`) causing edit failures.

**Required Changes**:
1. Remove the "Cost/Unit" display (lines 512-517)
2. Add color-coded expiry date display with logic:
   - **Green box + "Good" badge**: >30 days until expiry
   - **Yellow box + "Expiring Soon" badge**: ≤30 days until expiry
   - **Red box + "Expired" badge**: Past expiry date
3. Show days remaining/overdue

**Implementation**:
```typescript
{item.expiryDate && (() => {
  const today = new Date();
  const expiryDate = new Date(item.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let bgColor, textColor, borderColor, statusText;
  
  if (daysUntilExpiry < 0) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    borderColor = 'border-red-300';
    statusText = language === 'en' ? 'Expired' : 'समाप्त';
  } else if (daysUntilExpiry <= 30) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-300';
    statusText = language === 'en' ? 'Expiring Soon' : 'जल्द समाप्त';
  } else {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
    borderColor = 'border-green-300';
    statusText = language === 'en' ? 'Good' : 'अच्छा';
  }
  
  return (
    <div className={`flex items-center justify-between p-2 rounded border-2 ${bgColor} ${borderColor} mb-3`}>
      <div>
        <span className={`text-xs font-semibold ${textColor}`}>
          {language === 'en' ? 'Expiry' : 'समाप्ति'}: {expiryDate.toLocaleDateString()}
        </span>
        <div className={`text-xs ${textColor}`}>
          {daysUntilExpiry < 0 
            ? `${Math.abs(daysUntilExpiry)} ${language === 'en' ? 'days ago' : 'दिन पहले'}`
            : `${daysUntilExpiry} ${language === 'en' ? 'days left' : 'दिन शेष'}`
          }
        </div>
      </div>
      <Badge className={`${bgColor} ${textColor} border-0`}>
        {statusText}
      </Badge>
    </div>
  );
})()}
```

---

### **TASK 2: Update VetDashboard Navigation**
**File**: `src/components/VetDashboard.tsx`

Add navigation buttons to access new features:
1. **Hospital Records** button
2. **Messages** button (inbox)

**Add after the "Medication & Treatment Tracker" button** (around line 285):

```typescript
<Button
  onClick={() => setCurrentScreen('hospital-records')}
  className="w-full h-14 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg"
>
  <FileText className="w-5 h-5 mr-2" />
  {language === 'en' ? 'Hospital Records' : 'अस्पताल रिकॉर्ड'}
</Button>

<Button
  onClick={() => setCurrentScreen('messages')}
  className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
>
  <Mail className="w-5 h-5 mr-2" />
  {language === 'en' ? 'Messages' : 'संदेश'}
</Button>
```

---

### **TASK 3: Update AdminDashboard Navigation**
**File**: `src/components/AdminDashboard.tsx`

Add similar navigation buttons for:
1. **Hospital Records** (read-only)
2. **Messages** (send messages)
3. **Weekly Compliance Dashboard** (new feature)

---

### **TASK 4: Update App.tsx Routes**
**File**: `src/App.tsx`

Add new screen routes in the `renderScreen()` function:

```typescript
case 'hospital-records':
  return <HospitalRecords />;
case 'messages':
  return <MessagingHub />;
```

Don't forget to import the components at the top:
```typescript
import { HospitalRecords } from './components/HospitalRecords';
import { MessagingHub } from './components/MessagingHub';
```

---

### **TASK 5: Implement Backend API Endpoints**
**File**: `backend_api.py`

#### **5.1: Enhanced Observation Endpoint**
```python
@app.route('/process_enhanced_observation', methods=['POST'])
def process_enhanced_observation():
    try:
        log_data = json.loads(request.form.get('logData'))
        
        animal_id = log_data.get('animalId')
        submitted_by = log_data.get('submittedBy')
        log_type = log_data.get('logType')
        questions = log_data.get('questions')
        animal_health = log_data.get('animalHealth')
        kraal_health = log_data.get('kraalHealth')
        
        # Handle media uploads
        gate_image = request.files.get('gateImage')
        animal_image = request.files.get('animalImage')
        animal_video = request.files.get('animalVideo')
        
        # Upload to Firebase Storage
        gate_image_url = upload_to_storage(gate_image, 'gate_images') if gate_image else None
        animal_image_url = upload_to_storage(animal_image, 'animal_images') if animal_image else None
        animal_video_url = upload_to_storage(animal_video, 'animal_videos') if animal_video else None
        
        observation_data = {
            'animalId': animal_id,
            'submittedBy': submitted_by,
            'createdAt': log_data.get('createdAt'),
            'logType': log_type,
            'questions': questions,
            'animalHealth': animal_health,
            'kraalHealth': kraal_health,
            'gateImageUrl': gate_image_url,
            'animalImageUrl': animal_image_url,
            'animalVideoUrl': animal_video_url,
            'isComplete': True,
        }
        
        doc_ref = db.collection('enhanced_observations').add(observation_data)
        
        # Create alerts for critical conditions
        if animal_health.get('deathObserved'):
            create_alert('death', animal_id, 'Death reported', submitted_by)
        if animal_health.get('isInjured') and animal_health.get('injuryType') in ['Severe', 'Head']:
            create_alert('injury', animal_id, f"Severe injury: {animal_health.get('injuryType')}", submitted_by)
        
        return jsonify(observation_data), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
```

#### **5.2: Hospital Records Endpoints**
```python
@app.route('/hospital_records', methods=['GET', 'POST'])
def hospital_records():
    if request.method == 'GET':
        records = db.collection('hospital_records').order_by('date', direction=firestore.Query.DESCENDING).stream()
        return jsonify([{**r.to_dict(), 'id': r.id} for r in records])
    
    elif request.method == 'POST':
        data = request.json
        doc_ref = db.collection('hospital_records').add(data)
        return jsonify({**data, 'id': doc_ref[1].id}), 201

@app.route('/hospital_records/<record_id>', methods=['PUT', 'DELETE'])
def hospital_record_detail(record_id):
    if request.method == 'PUT':
        data = request.json
        db.collection('hospital_records').document(record_id).update(data)
        return jsonify({**data, 'id': record_id})
    
    elif request.method == 'DELETE':
        db.collection('hospital_records').document(record_id).delete()
        return jsonify({"message": "Deleted"}), 200
```

#### **5.3: Messaging Endpoints**
```python
@app.route('/messages', methods=['POST'])
def send_message():
    data = request.json
    doc_ref = db.collection('messages').add(data)
    return jsonify({**data, 'id': doc_ref[1].id}), 201

@app.route('/messages/inbox/<user_id>', methods=['GET'])
def get_inbox(user_id):
    messages = db.collection('messages')\
        .where('to', 'array_contains_any', [user_id, 'all'])\
        .order_by('createdAt', direction=firestore.Query.DESCENDING)\
        .stream()
    return jsonify([{**m.to_dict(), 'id': m.id} for m in messages])

@app.route('/messages/sent', methods=['GET'])
def get_sent_messages():
    messages = db.collection('messages')\
        .order_by('createdAt', direction=firestore.Query.DESCENDING)\
        .stream()
    return jsonify([{**m.to_dict(), 'id': m.id} for m in messages])

@app.route('/messages/<message_id>/read', methods=['PUT'])
def mark_message_read(message_id):
    db.collection('messages').document(message_id).update({'read': True})
    return jsonify({"message": "Marked as read"}), 200
```

#### **5.4: Helper Function for Firebase Storage**
```python
def upload_to_storage(file, folder):
    """Upload file to Firebase Storage and return public URL"""
    if not file:
        return None
    
    filename = f"{folder}/{datetime.now().timestamp()}_{file.filename}"
    blob = bucket.blob(filename)
    blob.upload_from_file(file)
    blob.make_public()
    
    return blob.public_url
```

---

### **TASK 6: Update requirements.txt**
**File**: `requirements.txt`

Add these packages if not already present:
```
openpyxl==3.1.2
python-dateutil==2.8.2
```

---

### **TASK 7: Create Weekly Compliance Dashboard**
**New File**: `src/components/WeeklyComplianceDashboard.tsx`

Create a dashboard showing:
1. **Zookeeper Compliance Table**:
   - Name
   - Morning logs submitted (7 days)
   - Evening logs submitted (7 days)
   - Compliance percentage
   - Color coding: Green (>90%), Yellow (70-90%), Red (<70%)

2. **Summary Cards**:
   - Total logs expected
   - Total logs submitted
   - Overall compliance %
   - Missed logs count

3. **Export to Excel** button

**Implementation Hint**:
```typescript
const calculateCompliance = (zookeeperName: string, logs: any[]) => {
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  
  const morningLogs = logs.filter(log => 
    log.submittedBy === zookeeperName && 
    log.logType === 'morning' &&
    last7Days.includes(log.createdAt.split('T')[0])
  ).length;
  
  const eveningLogs = logs.filter(log => 
    log.submittedBy === zookeeperName && 
    log.logType === 'evening' &&
    last7Days.includes(log.createdAt.split('T')[0])
  ).length;
  
  const compliance = ((morningLogs + eveningLogs) / 14) * 100;
  
  return { morningLogs, eveningLogs, compliance };
};
```

---

### **TASK 8: Implement Scheduling System**
**File**: `backend_api.py`

Add a background thread to check log deadlines and send reminders:

```python
import threading
from datetime import datetime, time

def check_log_deadlines():
    while True:
        now = datetime.now()
        current_time = now.time()
        
        # Morning: 6 AM - 11:30 AM
        if time(6, 0) <= current_time <= time(11, 30):
            check_and_remind('morning', time(11, 30))
        
        # Evening: 2 PM - 4:30 PM
        elif time(14, 0) <= current_time <= time(16, 30):
            check_and_remind('evening', time(16, 30))
        
        time.sleep(1800)  # 30 minutes

def check_and_remind(log_type, deadline):
    today = datetime.now().date().isoformat()
    zookeepers = db.collection('users').where('role', '==', 'zookeeper').stream()
    
    for keeper in zookeepers:
        logs = db.collection('enhanced_observations')\
            .where('submittedBy', '==', keeper.get('name'))\
            .where('logType', '==', log_type)\
            .where('createdAt', '>=', today)\
            .stream()
        
        if not list(logs):
            # Send reminder
            send_notification(keeper.id, f"Reminder: Submit {log_type} log")
            
            # Escalate if past deadline
            if datetime.now().time() > deadline:
                escalate_to_admin(keeper.get('name'), log_type)

# Start thread
threading.Thread(target=check_log_deadlines, daemon=True).start()
```

---

## ✅ **TESTING CHECKLIST**

After implementation, test:

1. ✅ Complete daily log flow (Questions → Animal Health → Kraal Health → Media → Submit)
2. ✅ Hospital Records CRUD (Create, Read, Update, Delete)
3. ✅ Messaging (Admin/Vet send, Zookeeper receive)
4. ✅ Inventory color coding (Green/Yellow/Red based on expiry)
5. ✅ Weekly compliance dashboard
6. ✅ Scheduling reminders
7. ✅ Excel export
8. ✅ Role-based access control

---

## 🎯 **PRIORITY ORDER**

1. **HIGH**: Fix Inventory color coding
2. **HIGH**: Implement backend endpoints (5.1, 5.2, 5.3)
3. **MEDIUM**: Update dashboard navigation (Tasks 2, 3, 4)
4. **MEDIUM**: Create Weekly Compliance Dashboard
5. **LOW**: Implement scheduling system
6. **LOW**: Add Excel export

---

## 📝 **NOTES**

- All components use **bilingual support** (English/Hindi)
- Follow existing **code style** and **component patterns**
- Use **shadcn/ui** components for consistency
- Add **toast notifications** for user feedback
- Implement **error handling** for all API calls
- Use **motion/react** for animations

---

## 🚀 **DEPLOYMENT**

After completing all tasks:
1. Test locally
2. Commit changes: `git add . && git commit -m "feat: Complete major system upgrade"`
3. Push to main: `git push origin main`
4. Vercel will auto-deploy

---

**Good luck! This is a comprehensive upgrade that will significantly improve the system's functionality and user experience.**
