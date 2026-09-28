import express from 'express';
import { Store } from '../data/store.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if requester is Admin or Health Wing Leader
const canManageHealthWing = async (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const healthWing = await Store.getWingBySlug('health');
  if (!healthWing) return false;

  const leaderId = healthWing.leader?._id || healthWing.leader;
  const userId = String(user.id || user._id);

  if (leaderId && String(leaderId) === userId) return true;
  if (user.assignedWing && String(user.assignedWing) === String(healthWing._id)) return true;
  if (user.role === 'wing_leader' || user.role === 'coordinator') {
    if (user.volunteerWing && (user.volunteerWing.toLowerCase().includes('স্বাস্থ্য') || user.volunteerWing.toLowerCase().includes('health'))) {
      return true;
    }
  }

  return false;
};

// Helper to check if requester can view and respond to Emergency Cell requests:
// Admin, Health Wing Leader, OR Volunteer explicitly added to the Emergency Cell team.
const canViewEmergencyCell = async (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (await canManageHealthWing(user)) return true;

  const isTeamMember = await Store.isEmergencyTeamMember(user.id || user._id);
  return Boolean(isTeamMember);
};

// ============================================================================
// 1. FREE HEALTH CAMPS (ফ্রি স্বাস্থ্য ক্যাম্প)
// ============================================================================

// List health camps (Public)
router.get('/camps', optionalAuth, async (req, res, next) => {
  try {
    const { status, district } = req.query;
    const camps = await Store.getHealthCamps({ status, district });
    res.json(camps);
  } catch (err) {
    next(err);
  }
});

// Single health camp
router.get('/camps/:id', optionalAuth, async (req, res, next) => {
  try {
    const camp = await Store.getHealthCampById(req.params.id);
    if (!camp) return res.status(404).json({ error: 'Health Camp not found' });
    res.json(camp);
  } catch (err) {
    next(err);
  }
});

// Create new health camp (Admin & Health Wing Leader)
router.post('/camps', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can create health camps.' });
    }

    const { title, description, date, time, location, district, targetBeneficiaries, coverImage, doctors, services } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ error: 'Title, date, and location are required.' });
    }

    const newCamp = await Store.createHealthCamp({
      title: title.trim(),
      description: description || '',
      date: new Date(date),
      time: time || 'সকাল ৯:০০ - বিকাল ৪:০০',
      location: location.trim(),
      district: district || 'ঝালকাঠি',
      targetBeneficiaries: targetBeneficiaries || '৫০০+ মানুষ',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      doctors: Array.isArray(doctors) ? doctors : [],
      services: Array.isArray(services) && services.length > 0 ? services : [
        'বিনামূল্যে সাধারণ স্বাস্থ্য পরীক্ষা',
        'বিনামূল্যে প্রয়োজনীয় ওষুধ বিতরণ',
        'ব্লাড প্রেসার ও ডায়াবেটিস টেস্ট',
        'রক্তের গ্রুপ নির্ণয় (Blood Grouping)',
        'মা ও শিশু স্বাস্থ্য পরামর্শ'
      ],
      createdBy: req.user.id || req.user._id
    });

    await Store.addAuditLog({
      user: req.user.name || req.user.email,
      role: req.user.role,
      action: 'CREATE_HEALTH_CAMP',
      module: 'HealthWing',
      recordId: String(newCamp._id),
      details: `Created health camp: ${newCamp.title}`
    });

    res.status(201).json({ message: 'Health camp created successfully', camp: newCamp });
  } catch (err) {
    next(err);
  }
});

// Update health camp (Admin & Health Wing Leader)
router.put('/camps/:id', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can update health camps.' });
    }

    const updated = await Store.updateHealthCamp(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Health Camp not found' });

    res.json({ message: 'Health camp updated successfully', camp: updated });
  } catch (err) {
    next(err);
  }
});

// Delete health camp (Admin & Health Wing Leader)
router.delete('/camps/:id', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can delete health camps.' });
    }

    const deleted = await Store.deleteHealthCamp(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Health Camp not found' });

    res.json({ message: 'Health camp deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Register participant for free health camp (Public / Member)
router.post('/camps/:id/register', optionalAuth, async (req, res, next) => {
  try {
    const { name, phone, age, gender } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required.' });
    }

    const participantData = {
      user: req.user ? (req.user.id || req.user._id) : null,
      name: name.trim(),
      phone: phone.trim(),
      age: age ? Number(age) : null,
      gender: gender || 'Male',
      registeredAt: new Date()
    };

    const updatedCamp = await Store.registerParticipantForCamp(req.params.id, participantData);
    if (!updatedCamp) return res.status(404).json({ error: 'Health Camp not found' });

    res.json({ message: 'Successfully registered for health camp!', camp: updatedCamp });
  } catch (err) {
    next(err);
  }
});

// Assign volunteer to camp (Admin & Leader)
router.post('/camps/:id/assign-volunteer', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { userId, name, phone, role } = req.body;
    if (!name) return res.status(400).json({ error: 'Volunteer name is required' });

    const volunteerData = {
      user: userId || null,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      role: role || 'ক্যাম্প ভলান্টিয়ার'
    };

    const camp = await Store.assignVolunteerToCamp(req.params.id, volunteerData);
    res.json({ message: 'Volunteer assigned successfully', camp });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 2. BLOOD BANK (রক্তদান কেন্দ্র ও ডোনার ডিরেক্টরি)
// ============================================================================

// Search donors (Public)
router.get('/donors', async (req, res, next) => {
  try {
    const { bloodGroup, location, district, status, search } = req.query;
    const donors = await Store.getBloodDonors({ bloodGroup, location, district, status, search });
    res.json(donors);
  } catch (err) {
    next(err);
  }
});

// Single donor
router.get('/donors/:id', async (req, res, next) => {
  try {
    const donor = await Store.getBloodDonorById(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    res.json(donor);
  } catch (err) {
    next(err);
  }
});

// Add / Register Blood Donor (Member self-registration or Leader/Admin)
router.post('/donors', optionalAuth, async (req, res, next) => {
  try {
    const { name, age, gender, bloodGroup, phone, alternatePhone, location, district, lastDonationDate, donationCount, notes } = req.body;
    if (!name || !age || !bloodGroup || !phone) {
      return res.status(400).json({ error: 'Name, age, blood group, and phone number are required.' });
    }

    const newDonor = await Store.createBloodDonor({
      name: name.trim(),
      age: Number(age),
      gender: gender || 'Male',
      bloodGroup: bloodGroup.trim().toUpperCase(),
      phone: phone.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : '',
      location: location ? location.trim() : 'ঝালকাঠি সদর',
      district: district ? district.trim() : 'ঝালকাঠি',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      donationCount: Number(donationCount || 0),
      status: 'available',
      notes: notes || '',
      user: req.user ? (req.user.id || req.user._id) : null,
      registeredBy: req.user ? (req.user.id || req.user._id) : null
    });

    res.status(201).json({ message: 'Blood donor registered successfully', donor: newDonor });
  } catch (err) {
    next(err);
  }
});

// Update Blood Donor (Leader, Admin, or self)
router.put('/donors/:id', verifyToken, async (req, res, next) => {
  try {
    const isLeader = await canManageHealthWing(req.user);
    const existing = await Store.getBloodDonorById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Donor not found' });

    const isOwner = existing.user && String(existing.user) === String(req.user.id || req.user._id);
    if (!isLeader && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized to update this donor profile' });
    }

    const updated = await Store.updateBloodDonor(req.params.id, req.body);
    res.json({ message: 'Donor updated successfully', donor: updated });
  } catch (err) {
    next(err);
  }
});

// Delete Blood Donor (Leader or Admin)
router.delete('/donors/:id', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can delete donors' });
    }

    const deleted = await Store.deleteBloodDonor(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Donor not found' });

    res.json({ message: 'Donor deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 3. EMERGENCY CELL (হাসপাতাল ভর্তি ও জরুরি সহায়তা সেল)
// ============================================================================

// Submit emergency message / request for Jhalokathi or Barishal Hospital
// (Any Member or Public)
router.post('/emergency-requests', optionalAuth, async (req, res, next) => {
  try {
    const { patientName, hospital, ward, contactName, contactPhone, emergencyType, urgency, description } = req.body;
    if (!patientName || !contactName || !contactPhone || !description) {
      return res.status(400).json({ error: 'Patient name, contact name, phone, and details are required.' });
    }

    const newReq = await Store.createEmergencyRequest({
      patientName: patientName.trim(),
      hospital: hospital || 'ঝালকাঠি সদর হাসপাতাল',
      ward: ward ? ward.trim() : '',
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      emergencyType: emergencyType || 'admission',
      urgency: urgency || 'high',
      description: description.trim(),
      status: 'pending',
      requester: {
        user: req.user ? (req.user.id || req.user._id) : null,
        name: req.user ? req.user.name : contactName.trim(),
        phone: contactPhone.trim()
      }
    });

    res.status(201).json({
      message: 'Emergency request submitted successfully. Our team will contact you shortly.',
      request: newReq
    });
  } catch (err) {
    next(err);
  }
});

// Get user's own submitted emergency requests
router.get('/emergency-requests/my', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const phone = req.query.phone || (req.user ? req.user.phone : null);
    const myReqs = await Store.getMyEmergencyRequests(userId, phone);
    res.json(myReqs);
  } catch (err) {
    next(err);
  }
});

// List all emergency requests:
// STRICT ACCESS: Only Admin, Health Wing Leader, and Volunteers specifically ADDED to Emergency Cell
router.get('/emergency-requests', verifyToken, async (req, res, next) => {
  try {
    const hasAccess = await canViewEmergencyCell(req.user);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied. Only Admin, Health Wing Leader, and authorized Emergency Cell volunteers can view emergency requests.'
      });
    }

    const { status, hospital, urgency } = req.query;
    const list = await Store.getEmergencyRequests({ status, hospital, urgency });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Single emergency request details
router.get('/emergency-requests/:id', verifyToken, async (req, res, next) => {
  try {
    const emergencyReq = await Store.getEmergencyRequestById(req.params.id);
    if (!emergencyReq) return res.status(404).json({ error: 'Emergency request not found' });

    const hasAccess = await canViewEmergencyCell(req.user);
    const isRequester =
      emergencyReq.requester?.user &&
      String(emergencyReq.requester.user) === String(req.user.id || req.user._id);

    if (!hasAccess && !isRequester) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(emergencyReq);
  } catch (err) {
    next(err);
  }
});

// Update status / assign responder to emergency request (Admin, Leader, or Emergency Team Member)
router.patch('/emergency-requests/:id/status', verifyToken, async (req, res, next) => {
  try {
    const hasAccess = await canViewEmergencyCell(req.user);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Only authorized Emergency Cell members can update request status.' });
    }

    const { status, assignedVolunteer, message } = req.body;
    const updated = await Store.updateEmergencyRequestStatus(req.params.id, {
      status,
      assignedVolunteer,
      responderName: req.user.name,
      message,
      user: req.user
    });

    if (!updated) return res.status(404).json({ error: 'Emergency request not found' });

    res.json({ message: 'Emergency request updated successfully', request: updated });
  } catch (err) {
    next(err);
  }
});

// Add response message to emergency request
router.post('/emergency-requests/:id/responses', verifyToken, async (req, res, next) => {
  try {
    const emergencyReq = await Store.getEmergencyRequestById(req.params.id);
    if (!emergencyReq) return res.status(404).json({ error: 'Emergency request not found' });

    const hasAccess = await canViewEmergencyCell(req.user);
    const isRequester =
      emergencyReq.requester?.user &&
      String(emergencyReq.requester.user) === String(req.user.id || req.user._id);

    if (!hasAccess && !isRequester) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const roleTitle = req.user.role === 'admin'
      ? 'এডমিন'
      : (await canManageHealthWing(req.user))
        ? 'হেলথ উইং লিডার'
        : hasAccess
          ? 'ইমার্জেন্সি ভলান্টিয়ার'
          : 'আবেদনকারী';

    const updated = await Store.addEmergencyResponse(req.params.id, {
      responder: req.user.id || req.user._id,
      responderName: req.user.name,
      responderRole: roleTitle,
      message: message.trim()
    });

    res.json({ message: 'Response posted successfully', request: updated });
  } catch (err) {
    next(err);
  }
});

// Delete emergency request (Admin & Leader only)
router.delete('/emergency-requests/:id', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can delete emergency requests.' });
    }

    const deleted = await Store.deleteEmergencyRequest(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Emergency request not found' });

    res.json({ message: 'Emergency request deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 4. EMERGENCY CELL TEAM MEMBERS (টিম সদস্য ব্যবস্থাপনা)
// ============================================================================

// Get emergency team members list (Leader, Admin, or Team Member)
router.get('/emergency-team', verifyToken, async (req, res, next) => {
  try {
    const hasAccess = await canViewEmergencyCell(req.user);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const team = await Store.getEmergencyTeamMembers();
    res.json(team);
  } catch (err) {
    next(err);
  }
});

// Add volunteer to Emergency Cell team (Admin & Health Wing Leader ONLY)
// Once added, that volunteer gets automatic access!
router.post('/emergency-team', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({
        error: 'Only Admin and Health Wing Leader can add volunteers to the Emergency Cell team.'
      });
    }

    const { userId, name, phone, email, roleTitle, hospitalAssigned } = req.body;
    if (!userId || !name || !phone) {
      return res.status(400).json({ error: 'User ID, name, and phone are required.' });
    }

    const newMember = await Store.addEmergencyTeamMember({
      user: userId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      roleTitle: roleTitle || 'ইমার্জেন্সি সেল ভলান্টিয়ার',
      hospitalAssigned: hospitalAssigned || 'all',
      addedBy: req.user.id || req.user._id
    });

    await Store.addAuditLog({
      user: req.user.name || req.user.email,
      role: req.user.role,
      action: 'ADD_EMERGENCY_CELL_VOLUNTEER',
      module: 'HealthWing',
      recordId: String(userId),
      details: `Added volunteer ${name} to Emergency Cell team`
    });

    res.status(201).json({
      message: 'Volunteer added to Emergency Cell team successfully with automatic access.',
      member: newMember
    });
  } catch (err) {
    next(err);
  }
});

// Remove volunteer from Emergency Cell team (Admin & Health Wing Leader ONLY)
router.delete('/emergency-team/:id', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({
        error: 'Only Admin and Health Wing Leader can remove volunteers from the Emergency Cell team.'
      });
    }

    const removed = await Store.removeEmergencyTeamMember(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Member not found' });

    res.json({ message: 'Volunteer removed from Emergency Cell team.' });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 5. VOLUNTEER TASK ASSIGNMENTS (কাজের দায়িত্ব অর্পণ)
// ============================================================================

// List tasks (Leader/Admin sees all, volunteer sees their assigned tasks)
router.get('/tasks', verifyToken, async (req, res, next) => {
  try {
    const isLeader = await canManageHealthWing(req.user);
    const { status, campId } = req.query;

    const assignedToUserId = isLeader ? req.query.assignedTo : (req.user.id || req.user._id);
    const tasks = await Store.getHealthTasks({ status, assignedToUserId, campId });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Create task & assign to volunteer (Admin & Health Wing Leader ONLY)
router.post('/tasks', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can assign tasks.' });
    }

    const { title, description, assignedTo, camp, campTitle, priority, dueDate } = req.body;
    if (!title || !assignedTo || !assignedTo.name) {
      return res.status(400).json({ error: 'Task title and assigned volunteer name are required.' });
    }

    const newTask = await Store.createHealthTask({
      title: title.trim(),
      description: description || '',
      assignedTo: {
        user: assignedTo.user || null,
        name: assignedTo.name.trim(),
        phone: assignedTo.phone ? assignedTo.phone.trim() : '',
        email: assignedTo.email ? assignedTo.email.trim() : ''
      },
      camp: camp || null,
      campTitle: campTitle || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
      assignedBy: req.user.id || req.user._id
    });

    res.status(201).json({ message: 'Task assigned successfully', task: newTask });
  } catch (err) {
    next(err);
  }
});

// Update task status (Leader, Admin, or Assigned Volunteer)
router.patch('/tasks/:id/status', verifyToken, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updated = await Store.updateHealthTaskStatus(req.params.id, { status, notes });
    if (!updated) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task status updated successfully', task: updated });
  } catch (err) {
    next(err);
  }
});

// Delete task (Admin & Leader ONLY)
router.delete('/tasks/:id', verifyToken, async (req, res, next) => {
  try {
    if (!(await canManageHealthWing(req.user))) {
      return res.status(403).json({ error: 'Only Admin and Health Wing Leader can delete tasks.' });
    }

    const deleted = await Store.deleteHealthTask(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
