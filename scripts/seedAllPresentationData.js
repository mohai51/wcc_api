import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';

import Wing from '../models/Wing.js';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Account from '../models/Account.js';
import Activity from '../models/Activity.js';
import Vendor from '../models/Vendor.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Transaction from '../models/Transaction.js';
import Advance from '../models/Advance.js';
import Reimbursement from '../models/Reimbursement.js';
import VolunteerLog from '../models/VolunteerLog.js';
import MemberRequest from '../models/MemberRequest.js';
import Program from '../models/Program.js';
import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import Issue from '../models/Issue.js';
import Course from '../models/Course.js';
import Book from '../models/Book.js';
import BookRequest from '../models/BookRequest.js';
import HealthCamp from '../models/HealthCamp.js';
import BloodDonor from '../models/BloodDonor.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import EmergencyTeamMember from '../models/EmergencyTeamMember.js';
import HealthTask from '../models/HealthTask.js';
import Notification from '../models/Notification.js';

export const seedAllPresentationData = async () => {
  console.log('================================================================');
  console.log('🌟 WCC MASTER PRESENTATION DATA POPULATION SCRIPT');
  console.log('================================================================');

  await connectDB();

  // ---------------------------------------------------------------------------
  // 0. Base Users & Roles Lookup
  // ---------------------------------------------------------------------------
  console.log('\n[1/15] Verifying Core Management Users...');
  const adminUser = await User.findOne({ role: 'admin' });
  let volunteerUser = await User.findOne({ email: 'volunteer@wecanchange.org' });
  let memberUser = await User.findOne({ email: 'member@wecanchange.org' });
  let healthLeader = await User.findOne({ email: 'coordinator.health@wecanchange.org' });
  let eduLeader = await User.findOne({ email: 'tanvir.chowdhury@example.com' }) || await User.findOne({ email: 'coordinator.education@wecanchange.org' });

  if (!volunteerUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    volunteerUser = await User.create({
      name: 'তানভীর হোসেন',
      email: 'volunteer@wecanchange.org',
      password: hashedPassword,
      role: 'volunteer',
      phone: '01712-998877',
      memberId: 'WCC-VOL-0001',
      status: 'active'
    });
  }

  if (!memberUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    memberUser = await User.create({
      name: 'রফিকুল ইসলাম',
      email: 'member@wecanchange.org',
      password: hashedPassword,
      role: 'member',
      phone: '01812-445566',
      memberId: 'WCC-MEM-0001',
      status: 'active'
    });
  }

  // ---------------------------------------------------------------------------
  // 1. Wings (Verify all 5 Core Wings and Leaders)
  // ---------------------------------------------------------------------------
  console.log('\n[2/15] Verifying 5 Core Organizational Wings & Leaders...');
  const targetWings = [
    {
      nameEn: 'Education',
      nameBn: 'শিক্ষা উইং',
      slug: 'education',
      description: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের শিক্ষাবৃত্তি, বিনামূল্যে স্কিল ডেভেলপমেন্ট কোর্স, বই অনুদান ও ক্যারিয়ার মেন্টরশিপ।',
      missionPoints: [
        'Free Skill Courses for Members',
        'Book Donation & Exchange Library',
        'Student Mentorship & Scholarships'
      ],
      coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
    },
    {
      nameEn: 'Health',
      nameBn: 'স্বাস্থ্য উইং',
      slug: 'health',
      description: 'বিনামূল্যে স্বাস্থ্য ও চক্ষু ক্যাম্প, স্বেচ্ছায় রক্তদান নেটওয়ার্ক এবং জরুরি টেলিমেডিসিন ও হাসপাতাল সহায়তা সেবা।',
      missionPoints: [
        'Voluntary Blood Drives & Donor Bank',
        'Free Medical & Eye Health Camps',
        'Emergency Hospital Desk & Ambulance Cell'
      ],
      coverImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800'
    },
    {
      nameEn: 'Sports',
      nameBn: 'খেলাধুলা উইং',
      slug: 'sports',
      description: 'মাদক ও ডিজিটাল আসক্তি মুক্ত সমাজ গঠনে তৃণমূল ফুটবল, ক্রিকেট ও যুব অ্যাথলেটিক্স প্রতিযোগিতা আয়োজন।',
      missionPoints: [
        'Community Sports Tournaments',
        'Youth Physical Fitness & Discipline',
        'Athletics Equipment & Coaching Support'
      ],
      coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800'
    },
    {
      nameEn: 'Cultural',
      nameBn: 'সংস্কৃতি উইং',
      slug: 'cultural',
      description: 'বাঙালি সংস্কৃতি, ভাষা আন্দোলন ও মুক্তিযুদ্ধের সঠিক ইতিহাস চর্চা, সাহিত্য সম্মেলন ও সৃজনশীল নাট্যকর্ম।',
      missionPoints: [
        'Cultural Festivals & Exhibitions',
        'Creative Arts & Drama Workshops',
        'Youth Literary Circles & Debates'
      ],
      coverImage: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=800'
    },
    {
      nameEn: 'Environment',
      nameBn: 'পরিবেশ উইং',
      slug: 'environment',
      description: 'সুগন্ধা নদী রক্ষা, ব্যাপক বৃক্ষরোপণ, বর্জ্য নিষ্কাশন ও প্লাস্টিক দূষণ রোধে তরুণদের পরিবেশ আন্দোলন।',
      missionPoints: [
        'Tree Plantation Campaigns',
        'River Cleanliness & Conservation',
        'Plastic Pollution Awareness & Recycling'
      ],
      coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const wingDocs = {};
  for (const tw of targetWings) {
    const doc = await Wing.findOneAndUpdate(
      { slug: tw.slug },
      { $set: tw },
      { upsert: true, new: true }
    );
    wingDocs[tw.slug] = doc;
  }

  // Ensure Health Leader
  if (healthLeader && wingDocs['health']) {
    healthLeader.role = 'wing_leader';
    healthLeader.assignedWing = wingDocs['health']._id;
    healthLeader.volunteerWing = 'স্বাস্থ্য উইং (Health)';
    await healthLeader.save();
    wingDocs['health'].leader = healthLeader._id;
    await wingDocs['health'].save();
  }

  // Ensure Education Leader
  if (eduLeader && wingDocs['education']) {
    eduLeader.role = 'wing_leader';
    eduLeader.assignedWing = wingDocs['education']._id;
    eduLeader.volunteerWing = 'শিক্ষা উইং (Education)';
    await eduLeader.save();
    wingDocs['education'].leader = eduLeader._id;
    await wingDocs['education'].save();
  }

  console.log('  ✓ 5 Organizational wings verified and leaders synchronized.');

  // ---------------------------------------------------------------------------
  // 2. Health Wing: Emergency Team Members
  // ---------------------------------------------------------------------------
  console.log('\n[3/15] Seeding Emergency Cell Team Members...');
  await EmergencyTeamMember.deleteMany({}); // Refresh team members cleanly
  const emergencyTeamData = [
    {
      user: healthLeader?._id || adminUser?._id,
      name: 'ডা. মোস্তাফিজুর রহমান',
      phone: '+880 1715-678901',
      email: 'dr.mostafizur@wecanchange.org',
      roleTitle: 'ইমার্জেন্সি সেল কো-অর্ডিনেটর ও মেডিকেল অফিসার',
      hospitalAssigned: 'jhalokathi',
      active: true
    },
    {
      user: volunteerUser._id,
      name: 'তানভীর হোসেন',
      phone: '01712-998877',
      email: 'volunteer@wecanchange.org',
      roleTitle: 'অ্যাম্বুলেন্স ও অক্সিজেন সিলিন্ডার সমন্বয়ক',
      hospitalAssigned: 'all',
      active: true
    },
    {
      user: memberUser._id,
      name: 'রফিকুল ইসলাম',
      phone: '01812-445566',
      email: 'member@wecanchange.org',
      roleTitle: 'জরুরি রক্তদাতা ও ডোনার নেটওয়ার্ক লিড',
      hospitalAssigned: 'jhalokathi',
      active: true
    },
    {
      user: adminUser._id,
      name: 'ফারহানা ইসলাম প্রীতি',
      phone: '01733-112233',
      email: 'farhana.priti@example.com',
      roleTitle: 'হাসপাতাল ইনডোর রোগী সহায়তা ভলান্টিয়ার',
      hospitalAssigned: 'barishal',
      active: true
    },
    {
      user: volunteerUser._id,
      name: 'মোঃ আরিফুল ইসলাম',
      phone: '01914-778899',
      email: 'ariful.islam@example.com',
      roleTitle: 'র‍্যাপিড রেসপন্স ও ফিল্ড লজিস্টিকস',
      hospitalAssigned: 'jhalokathi',
      active: true
    },
    {
      user: memberUser._id,
      name: 'সাদিয়া আক্তার রিমা',
      phone: '01819-334455',
      email: 'sadia.rima@example.com',
      roleTitle: 'টেলিমেডিসিন ও হেল্পলাইন ডেস্ক ভলান্টিয়ার',
      hospitalAssigned: 'all',
      active: true
    }
  ];

  for (const tm of emergencyTeamData) {
    await EmergencyTeamMember.create(tm);
  }
  console.log(`  ✓ Created ${emergencyTeamData.length} active emergency team members.`);

  // ---------------------------------------------------------------------------
  // 3. Health Wing: Free Health Camps
  // ---------------------------------------------------------------------------
  console.log('\n[4/15] Seeding Free Medical & Eye Camps across Jhalokathi...');
  await HealthCamp.deleteMany({}); // Fresh camps
  const campsData = [
    {
      title: 'ঝালকাঠি সদর ফ্রি মেডিকেল ও চক্ষু শিবির ২০২৬',
      description: 'WCC স্বাস্থ্য উইংয়ের উদ্যোগে ঝালকাঠি ও আশেপাশের গ্রামীণ অসচ্ছল মানুষের জন্য দিনব্যাপী সম্পূর্ণ বিনামূল্যে বিশেষজ্ঞ চিকিৎসা পরামর্শ, ডায়াবেটিস টেস্ট ও প্রয়োজনীয় অ্যান্টিবায়োটিক ওষুধ বিতরণ।',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: 'সকাল ৯:০০ - বিকাল ৪:০০',
      location: 'ঝালকাঠি সদর হাসপাতাল রোড সংলগ্ন পৌর পার্ক চত্বর',
      district: 'ঝালকাঠি',
      targetBeneficiaries: '৫০০+ সুবিধাবঞ্চিত মানুষ',
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      doctors: [
        { name: 'ডা. মোস্তাফিজুর রহমান', specialty: 'মেডিসিন বিশেষজ্ঞ', hospital: 'ঝালকাঠি সদর হাসপাতাল', degree: 'MBBS, FCPS (Medicine)' },
        { name: 'ডা. নুসরাত জাহান', specialty: 'চক্ষু বিশেষজ্ঞ ও সার্জন', hospital: 'বরিশাল শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল', degree: 'MBBS, DO (Ophthalmology)' }
      ],
      services: [
        'বিনামূল্যে বিশেষজ্ঞ চিকিৎসকের প্রেসক্রিপশন ও পরামর্শ',
        'বিনামূল্যে প্রয়োজনীয় অ্যান্টিবায়োটিক, গ্যাস্ট্রিক ও ভিটামিন ওষুধ বিতরণ',
        'ব্লাড প্রেসার ও ডায়াবেটিস স্ক্রিনিং',
        'রক্তের গ্রুপ নির্ণয় (Blood Grouping)',
        'চোখের ছানি পরীক্ষা ও প্রাথমিক ড্রপ বিতরণ'
      ],
      assignedVolunteers: [
        { user: volunteerUser._id, name: volunteerUser.name, phone: volunteerUser.phone, role: 'রোগী রেজিস্ট্রেশন সমন্বয়ক' },
        { user: memberUser._id, name: memberUser.name, phone: memberUser.phone, role: 'ওষুধ বিতরণ ডেস্ক' }
      ],
      registeredParticipants: [
        { name: 'আমিরুল ইসলাম', phone: '01711-223344', age: 48, gender: 'Male', registeredAt: new Date() },
        { name: 'রাবেয়া খাতুন', phone: '01811-334455', age: 55, gender: 'Female', registeredAt: new Date() },
        { name: 'মোঃ শাহ আলম', phone: '01911-445566', age: 62, gender: 'Male', registeredAt: new Date() },
        { name: 'ফাতেমা বেগম', phone: '01722-556677', age: 39, gender: 'Female', registeredAt: new Date() }
      ],
      status: 'upcoming',
      createdBy: adminUser?._id
    },
    {
      title: 'নলছিটি ডায়াবেটিস ও হাইপারটেনশন স্ক্রিনিং ক্যাম্প ২০২৬',
      description: 'নলছিটি উপজেলার তৃণমূল বয়োবৃদ্ধ ও সাধারণ মানুষের জন্য বিনামূল্যে ব্লাড সুগার পরীক্ষা, রক্তচাপ পরিমাপ ও লাইফস্টাইল রোগ প্রতিরোধের ওপর বিশেষ স্বাস্থ্য পরামর্শ।',
      date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      time: 'সকাল ৯:৩০ - দুপুর ২:৩০',
      location: 'নলছিটি পাইলট উচ্চ বিদ্যালয় অডিটোরিয়াম, নলছিটি',
      district: 'নলছিটি, ঝালকাঠি',
      targetBeneficiaries: '৩৫০+ বয়োজ্যেষ্ঠ ও নারী',
      coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
      doctors: [
        { name: 'ডা. সাজিদ আহমেদ', specialty: 'ডায়াবেটিস ও এন্ডোক্রাইনোলজিস্ট', hospital: 'বরিশাল ডায়াবেটিক হাসপাতাল', degree: 'MBBS, DEM' },
        { name: 'ডা. তানিয়া আফরোজ', specialty: 'কার্ডিয়াক ও জেনারেল ফিজিশিয়ান', hospital: 'ঝালকাঠি সদর হাসপাতাল', degree: 'MBBS, CCD' }
      ],
      services: [
        'র‍্যান্ডম ব্লাড সুগার (RBS) ও হিমোগ্লোবিন টেস্ট',
        'উচ্চ রক্তচাপ পরিমাপ ও স্বাস্থ্য কার্ড প্রদান',
        'ফ্রি ডায়াবেটিস ওষুধ ও খাদ্য তালিকা প্রদান',
        'বয়স্কদের হৃদরোগ প্রতিরোধে সচেতনতামূলক আলোচনা'
      ],
      assignedVolunteers: [
        { user: volunteerUser._id, name: volunteerUser.name, phone: volunteerUser.phone, role: 'টোকেন ও কিউ ম্যানেজমেন্ট' }
      ],
      registeredParticipants: [
        { name: 'কাশেম মাতুব্বর', phone: '01733-998811', age: 67, gender: 'Male', registeredAt: new Date() },
        { name: 'জহুরা খাতুন', phone: '01833-223344', age: 52, gender: 'Female', registeredAt: new Date() }
      ],
      status: 'upcoming',
      createdBy: adminUser?._id
    },
    {
      title: 'রাজাপুর মা ও শিশু পুষ্টি ও স্বাস্থ্য পরামর্শ ক্যাম্প',
      description: 'প্রান্তিক গর্ভবতী মা ও শিশুদের সুষম পুষ্টি, আয়রন-ফলিক অ্যাসিড ট্যাবলেট বিতরণ এবং নিয়মিত টিকাদান বিষয়ক পরামর্শ ক্যাম্প।',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      time: 'সকাল ১০:০০ - বিকাল ৩:০০',
      location: 'রাজাপুর উপজেলা পরিষদ মিলনায়তন',
      district: 'রাজাপুর, ঝালকাঠি',
      targetBeneficiaries: '৪০০+ মা ও শিশু',
      coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      doctors: [
        { name: 'ডা. সেলিনা আক্তার', specialty: 'গাইনী ও ধাত্রীবিদ্যা বিশেষজ্ঞ', hospital: 'রাজাপুর উপজেলা স্বাস্থ্য কমপ্লেক্স', degree: 'MBBS, DGO' },
        { name: 'ডা. মেহরাব হোসেন', specialty: 'শিশু রোগ বিশেষজ্ঞ (Pediatrician)', hospital: 'বরিশাল মেডিকেল কলেজ', degree: 'MBBS, DCH' }
      ],
      services: [
        'গর্ভবতী মায়েদের প্রসবপূর্ব (ANC) চেকআপ',
        'শিশুর ওজন, উচ্চতা ও বিকাশ পরীক্ষা',
        'ফ্রি ভিটামিন, ক্যালসিয়াম ও আয়রন সিরাপ বিতরণ',
        'মাতৃদুগ্ধ পান ও স্বাস্থ্যকর খাদ্যাভ্যাস কাউন্সিলিং'
      ],
      assignedVolunteers: [
        { user: volunteerUser._id, name: volunteerUser.name, phone: volunteerUser.phone, role: 'মা ও শিশু সহায়তা কিউ' },
        { user: memberUser._id, name: memberUser.name, phone: memberUser.phone, role: 'পুষ্টি কিট বিতরণ' }
      ],
      registeredParticipants: [
        { name: 'নাসরিন সুলতানা', phone: '01744-112233', age: 26, gender: 'Female', registeredAt: new Date() },
        { name: 'সালমা আক্তার', phone: '01844-334455', age: 29, gender: 'Female', registeredAt: new Date() },
        { name: 'রোকসানা পারভীন', phone: '01944-556677', age: 31, gender: 'Female', registeredAt: new Date() }
      ],
      status: 'completed',
      createdBy: adminUser?._id
    },
    {
      title: 'কাঠালিয়া উপকূলীয় প্রান্তিক সাধারণ স্বাস্থ্য শিবির',
      description: 'বিষখালী নদী তীরের দুর্যোগপ্রবণ কাঠালিয়া উপজেলার সুবিধাবঞ্চিত পরিবারের জন্য বিশেষজ্ঞ চিকিৎসক দলের সমন্বয়ে মেডিকেল ক্যাম্প।',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      time: 'সকাল ৯:০০ - বিকাল ৪:০০',
      location: 'কাঠালিয়া সরকারি পাইলট মডেল উচ্চ বিদ্যালয় মাঠ',
      district: 'কাঠালিয়া, ঝালকাঠি',
      targetBeneficiaries: '৬০০+ উপকূলীয় পরিবার',
      coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      doctors: [
        { name: 'ডা. মোস্তাফিজুর রহমান', specialty: 'মেডিসিন বিশেষজ্ঞ', hospital: 'ঝালকাঠি সদর হাসপাতাল', degree: 'MBBS, FCPS' }
      ],
      services: [
        'বিনামূল্যে সাধারণ স্বাস্থ্য ও চর্মরোগ পরীক্ষা',
        'পানি ও পতঙ্গবাহিত রোগ প্রতিরোধে পরামর্শ',
        'প্রয়োজনীয় অ্যান্টিবায়োটিক ও ওআরএস স্যালাইন বিতরণ',
        'রক্তের গ্রুপ ও ডায়াবেটিস স্ক্রিনিং'
      ],
      assignedVolunteers: [],
      registeredParticipants: [],
      status: 'upcoming',
      createdBy: adminUser?._id
    }
  ];

  const createdCamps = [];
  for (const c of campsData) {
    const doc = await HealthCamp.create(c);
    createdCamps.push(doc);
  }
  console.log(`  ✓ Created ${createdCamps.length} comprehensive Health Camps.`);

  // ---------------------------------------------------------------------------
  // 4. Health Wing: Health Tasks (Leader Volunteer Tasks)
  // ---------------------------------------------------------------------------
  console.log('\n[5/15] Seeding Health Wing Volunteer Tasks...');
  await HealthTask.deleteMany({}); // Fresh tasks
  const primaryCamp = createdCamps[0];
  const secondaryCamp = createdCamps[1];

  const healthTasksData = [
    {
      title: 'পৌর পার্ক চত্বরে প্যান্ডেল, ছাউনি ও ডাক্তারদের বুথ প্রস্তুত করা',
      description: 'মেডিকেল ক্যাম্পের জন্য ৫টি আলাদা ডক্টরস কর্নার, ১টি রক্ত পরীক্ষা টেবিল ও ওয়েটিং শেড বাঁধার কাজ তদারকি করতে হবে।',
      assignedTo: {
        user: volunteerUser._id,
        name: volunteerUser.name,
        phone: volunteerUser.phone,
        email: volunteerUser.email
      },
      camp: primaryCamp._id,
      campTitle: primaryCamp.title,
      priority: 'urgent',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      notes: 'পৌরসভার বিদ্যুৎ সংযোগ ও ফ্যানের ব্যবস্থা নিশ্চিত করা হয়েছে।'
    },
    {
      title: 'ওষুধ কোম্পানির কাছ থেকে ফ্রি স্যাম্পল ও অনুদানের ওষুধ সংগ্রহ',
      description: 'স্কয়ার ও বেক্সিমকোর স্থানীয় ডিপো থেকে অনুদানভুক্ত গ্যাস্ট্রিক, প্যারাসিটামল ও অ্যান্টিবায়োটিক ওষুধের কার্টন বুঝে নেওয়া।',
      assignedTo: {
        user: memberUser._id,
        name: memberUser.name,
        phone: memberUser.phone,
        email: memberUser.email
      },
      camp: primaryCamp._id,
      campTitle: primaryCamp.title,
      priority: 'high',
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      notes: 'ইনভয়েস মিলিয়ে কার্টনগুলো জেলা কেন্দ্রীয় অফিসে সংরক্ষণ করা আছে।'
    },
    {
      title: 'মাইকিং ও লিফলেট বিতরণ করে প্রান্তিক রোগীদের ক্যাম্প সম্পর্কে অবহিতকরণ',
      description: 'ঝালকাঠি সদরের চাঁদকাঠি, কলেজ রোড ও বাসস্ট্যান্ড মোড়ে রিকশায় মাইকিং এবং মসজিদের সামনে লিফলেট বিতরণ।',
      assignedTo: {
        user: volunteerUser._id,
        name: 'মোঃ আরিফুল ইসলাম',
        phone: '01914-778899',
        email: 'ariful.islam@example.com'
      },
      camp: primaryCamp._id,
      campTitle: primaryCamp.title,
      priority: 'medium',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      notes: '২,০০০ কপি লিফলেট বিতরণ সম্পন্ন।'
    },
    {
      title: 'প্রেসক্রিপশন প্যাড, টোকেন ও রেজিস্ট্রেশন কিট প্রিন্ট করা',
      description: 'মডার্ন প্রেস থেকে ৫০০টি ডক্টরস প্রেসক্রিপশন শিট ও ১,০০০টি সিরিয়াল টোকেন সংগ্রহ করতে হবে।',
      assignedTo: {
        user: memberUser._id,
        name: memberUser.name,
        phone: memberUser.phone,
        email: memberUser.email
      },
      camp: primaryCamp._id,
      campTitle: primaryCamp.title,
      priority: 'medium',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'completed',
      notes: 'প্রিন্ট ডেলিভারি পাওয়া গেছে এবং টোকেন সাজানো হয়েছে।'
    },
    {
      title: 'জরুরি ব্লাড গ্লুকোমিটার ও ডায়াবেটিস টেস্ট স্ট্রিপ ৫০ প্যাক সংগ্রহ',
      description: 'নলছিটি স্ক্রিনিং ক্যাম্পের জন্য ফার্মেসি পার্টনার থেকে ৫০ বক্স ওয়ান-টাচ ডায়াবেটিস স্ট্রিপ ও ল্যানসেট সংগ্রহ।',
      assignedTo: {
        user: volunteerUser._id,
        name: volunteerUser.name,
        phone: volunteerUser.phone,
        email: volunteerUser.email
      },
      camp: secondaryCamp._id,
      campTitle: secondaryCamp.title,
      priority: 'high',
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: 'ফার্মেসির কোটেশন অনুমোদন করা হয়েছে।'
    },
    {
      title: 'ঝালকাঠি সদর হাসপাতালে জরুরি অক্সিজেন সিলিন্ডার রিফিল নিশ্চিত করা',
      description: 'জরুরি রেসপন্স ইউনিটের দুটি জাম্বো অক্সিজেন সিলিন্ডার অক্সিজেন প্ল্যান্ট থেকে রিফিল সম্পন্ন করতে হবে।',
      assignedTo: {
        user: volunteerUser._id,
        name: volunteerUser.name,
        phone: volunteerUser.phone,
        email: volunteerUser.email
      },
      camp: primaryCamp._id,
      campTitle: primaryCamp.title,
      priority: 'urgent',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
      notes: 'সিলিন্ডার দুটি জরুরি সেল ভলান্টিয়ার তানভীরের জিম্মায় প্রস্তুত রাখা আছে।'
    },
    {
      title: 'নলছিটি স্বাস্থ্য ক্যাম্পের জন্য স্বেচ্ছাসেবকদের পরিচয়পত্র ও অ্যাপ্রন বিতরণ',
      description: '১৫ জন ফিল্ড ভলান্টিয়ারের জন্য WCC লোগোযুক্ত আইডি কার্ড ও ভলান্টিয়ার ভেস্ট প্রস্তুত করা।',
      assignedTo: {
        user: memberUser._id,
        name: memberUser.name,
        phone: memberUser.phone,
        email: memberUser.email
      },
      camp: secondaryCamp._id,
      campTitle: secondaryCamp.title,
      priority: 'medium',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      notes: 'আইডি কার্ড প্রিন্টিংয়ে গেছে।'
    },
    {
      title: 'রোগীদের বসার স্থান ও পানীয় জলের ড্রাম স্থাপন',
      description: 'পৌর পার্কের মাঠে পর্যাপ্ত প্লাস্টিকের চেয়ার ও বিশুদ্ধ ফিল্টার পানির দুটি ড্রাম নিশ্চিত করতে হবে।',
      assignedTo: {
        user: volunteerUser._id,
        name: volunteerUser.name,
        phone: volunteerUser.phone,
        email: volunteerUser.email
      },
      camp: primaryCamp._id,
      campTitle: primaryCamp.title,
      priority: 'low',
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: 'ভেন্ডরের সাথে চুক্তি হয়েছে।'
    }
  ];

  for (const ht of healthTasksData) {
    await HealthTask.create(ht);
  }
  console.log(`  ✓ Created ${healthTasksData.length} Volunteer Health Tasks.`);

  // ---------------------------------------------------------------------------
  // 5. Health Wing: Blood Bank Donors (All 8 Blood Groups)
  // ---------------------------------------------------------------------------
  console.log('\n[6/15] Seeding Voluntary Blood Donors Directory (8 Groups)...');
  await BloodDonor.deleteMany({}); // Refresh donor directory
  const bloodDonorsData = [
    {
      name: 'সাজিদ মাহমুদ',
      age: 24,
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '01712-345678',
      alternatePhone: '01812-345678',
      location: 'পশ্চিম চাঁদকাঠি, ঝালকাঠি সদর',
      district: 'ঝালকাঠি',
      lastDonationDate: new Date('2025-11-10'),
      donationCount: 5,
      status: 'available',
      notes: 'জরুরি প্রয়োজনে যেকোনো সময় ঝালকাঠি সদরে উপস্থিত হতে পারব।'
    },
    {
      name: 'ফারহানা তাবাসসুম',
      age: 22,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '01819-876543',
      location: 'কলেজ মোড়, ঝালকাঠি',
      district: 'ঝালকাঠি',
      lastDonationDate: new Date('2025-12-05'),
      donationCount: 3,
      status: 'available',
      notes: 'নিয়মিত স্বেচ্ছায় রক্তদাতা।'
    },
    {
      name: 'মাহমুদুল হাসান',
      age: 28,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '01911-223344',
      location: 'রূপাতলী বাসস্ট্যান্ড রোড',
      district: 'বরিশাল',
      lastDonationDate: new Date('2026-01-20'),
      donationCount: 7,
      status: 'available',
      notes: 'বরিশাল শের-ই-বাংলা হাসপাতালের কাছাকাছি অবস্থান।'
    },
    {
      name: 'ডা. মোস্তাফিজুর রহমান',
      age: 36,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+880 1715-678901',
      location: 'হাসপাতাল কোয়ার্টার, ঝালকাঠি সদর',
      district: 'ঝালকাঠি',
      lastDonationDate: new Date('2025-10-14'),
      donationCount: 14,
      status: 'available',
      notes: 'রেয়ার ও-নেগেটিভ রক্তদাতা ও স্বাস্থ্য উইং লিডার।'
    },
    {
      name: 'আব্দুল্লাহ আল নোমান',
      age: 25,
      gender: 'Male',
      bloodGroup: 'AB+',
      phone: '01715-114477',
      location: 'নলছিটি পৌরসভা মোড়',
      district: 'নলছিটি, ঝালকাঠি',
      lastDonationDate: new Date('2026-02-01'),
      donationCount: 4,
      status: 'recently_donated',
      notes: 'গত মাসে নলছিটিতে এক রোগীকে রক্ত দিয়েছি।'
    },
    {
      name: 'নুসরাত জাহান তানিয়া',
      age: 23,
      gender: 'Female',
      bloodGroup: 'A-',
      phone: '01817-558822',
      location: 'কাঠপট্টি খেয়াঘাট রোড',
      district: 'ঝালকাঠি',
      lastDonationDate: new Date('2025-09-18'),
      donationCount: 3,
      status: 'available',
      notes: 'রেয়ার এ-নেগেটিভ ব্লাড ডোনার।'
    },
    {
      name: 'মোঃ মেহেদী হাসান',
      age: 27,
      gender: 'Male',
      bloodGroup: 'B-',
      phone: '01913-669933',
      location: 'রাজাপুর বাজার',
      district: 'রাজাপুর, ঝালকাঠি',
      lastDonationDate: new Date('2025-11-28'),
      donationCount: 6,
      status: 'available',
      notes: 'রাজাপুর ও নলছিটি এলাকায় তাৎক্ষণিক যেতে পারি।'
    },
    {
      name: 'আরিয়ান রহমান',
      age: 26,
      gender: 'Male',
      bloodGroup: 'AB-',
      phone: '01718-442211',
      location: 'পৌরসভা চত্বর, কাঠালিয়া',
      district: 'কাঠালিয়া, ঝালকাঠি',
      lastDonationDate: new Date('2025-08-15'),
      donationCount: 4,
      status: 'available',
      notes: 'অতি দুর্লভ এবি-নেগেটিভ রক্তদাতা।'
    },
    {
      name: 'সাবরিনা ইসলাম নিঝুম',
      age: 21,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '01822-774411',
      location: 'ঝালকাঠি সরকারি মহিলা কলেজ রোড',
      district: 'ঝালকাঠি',
      lastDonationDate: new Date('2026-01-10'),
      donationCount: 2,
      status: 'available',
      notes: 'ঝালকাঠি সদরের যেকোনো ক্লিনিকে যেতে প্রস্তুত।'
    },
    {
      name: 'তানভীর আহমেদ চৌধুরী',
      age: 30,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '01711-234567',
      location: 'বাসস্ট্যান্ড সংলগ্ন, ঝালকাঠি সদর',
      district: 'ঝালকাঠি',
      lastDonationDate: new Date('2025-12-12'),
      donationCount: 9,
      status: 'available',
      notes: 'নিয়মিত রক্তদাতা ও শিক্ষা উইং মেন্টর।'
    },
    {
      name: 'কামরুল হাসান সাকিব',
      age: 24,
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '01925-883311',
      location: 'দপদপিয়া জিরো পয়েন্ট',
      district: 'নলছিটি, ঝালকাঠি',
      lastDonationDate: new Date('2026-02-20'),
      donationCount: 3,
      status: 'recently_donated',
      notes: 'দপদপিয়া ব্রিজের কাছাকাছি অবস্থান।'
    },
    {
      name: 'রাশেদুল হক',
      age: 29,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '01735-991122',
      location: 'মেডিকেল কলেজ হোস্টেল রোড',
      district: 'বরিশাল',
      lastDonationDate: new Date('2025-10-30'),
      donationCount: 8,
      status: 'available',
      notes: 'জরুরি ও-নেগেটিভ রক্তের সংকটে কল করুন।'
    }
  ];

  for (const bd of bloodDonorsData) {
    await BloodDonor.create(bd);
  }
  console.log(`  ✓ Created ${bloodDonorsData.length} Blood Donors across all 8 groups.`);

  // ---------------------------------------------------------------------------
  // 6. Health Wing: Emergency Requests & Responses
  // ---------------------------------------------------------------------------
  console.log('\n[7/15] Seeding Emergency Hospital Cell Requests & Live Responses...');
  await EmergencyRequest.deleteMany({}); // Refresh requests
  const emergencyRequestsData = [
    {
      patientName: 'আমেনা বেগম (৬৫ বছর)',
      hospital: 'ঝালকাঠি সদর হাসপাতাল',
      ward: 'মহিলা মেডিসিন ওয়ার্ড - বেড নং ১২',
      contactName: 'আব্দুল করিম (ছেলে)',
      contactPhone: '01755-112233',
      emergencyType: 'admission',
      urgency: 'critical',
      description: 'বৃদ্ধ মায়ের হঠাৎ তীব্র শ্বাসকষ্ট ও নিউমোনিয়ার লক্ষণ দেখা দেওয়ায় জরুরি অক্সিজেন সাপোর্ট ও দ্রুত ভর্তি সংক্রান্ত সহায়তা প্রয়োজন।',
      status: 'in_progress',
      assignedVolunteer: {
        user: volunteerUser._id,
        name: volunteerUser.name,
        phone: volunteerUser.phone
      },
      responses: [
        {
          responder: volunteerUser._id,
          responderName: 'তানভীর হোসেন (ভলান্টিয়ার)',
          responderRole: 'ইমার্জেন্সি সেল ভলান্টিয়ার',
          message: 'আমি রোগীর স্বজনদের সাথে কথা বলেছি। সদর হাসপাতালের অক্সিজেন সিলিন্ডার সংযোগ দিয়ে রোগীকে ভর্তি করানো হয়েছে। পরিস্থিতি স্থিতিশীল।',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          responder: healthLeader?._id,
          responderName: 'ডা. মোস্তাফিজুর রহমান',
          responderRole: 'স্বাস্থ্য উইং লিডার ও মেডিকেল অফিসার',
          message: 'ডিউটি ডাক্তারকে অবহিত করা হয়েছে। প্রয়োজনীয় ওষুধ ও ইনহেলার প্রদান করা হচ্ছে। ভলান্টিয়ার তানভীর ফলোআপ করছে।',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ],
      requester: {
        user: memberUser._id,
        name: 'আব্দুল করিম',
        phone: '01755-112233'
      }
    },
    {
      patientName: 'কামরুল ইসলাম (৩৮ বছর)',
      hospital: 'বরিশাল শের-ই-বাংলা মেডিকেল কলেজ ও সদর হাসপাতাল',
      ward: 'ট্রমা ও অর্থোপেডিক সার্জারি ওয়ার্ড - ৩য় তলা',
      contactName: 'শাহরিয়ার আহমেদ (ভাই)',
      contactPhone: '01855-667788',
      emergencyType: 'blood',
      urgency: 'critical',
      description: 'মোটরসাইকেল দুর্ঘটনায় গুরুতর আহত কামরুল ভাইয়ের জরুরি অপারেশনের জন্য আজ রাতের মধ্যেই ২ ব্যাগ AB- (এবি নেগেটিভ) রক্ত প্রয়োজন।',
      status: 'in_progress',
      assignedVolunteer: {
        user: memberUser._id,
        name: 'রফিকুল ইসলাম',
        phone: '01812-445566'
      },
      responses: [
        {
          responder: memberUser._id,
          responderName: 'রফিকুল ইসলাম (ব্লাড লিড)',
          responderRole: 'জরুরি রক্তদাতা নেটওয়ার্ক',
          message: 'আমাদের ডেটাবেজের কাঠালিয়ার এবি-নেগেটিভ ডোনার আরিয়ান রহমানের সাথে কথা হয়েছে। তিনি ব্লাড ব্যাংকে পৌঁছাচ্ছেন।',
          createdAt: new Date(Date.now() - 45 * 60 * 1000)
        }
      ],
      requester: {
        name: 'শাহরিয়ার আহমেদ',
        phone: '01855-667788'
      }
    },
    {
      patientName: 'রাবেয়া খাতুন (৭২ বছর)',
      hospital: 'ঝালকাঠি সদর হাসপাতাল',
      ward: 'করোনারি কেয়ার ইউনিট (CCU)',
      contactName: 'জাহিদুল ইসলাম',
      contactPhone: '01955-443322',
      emergencyType: 'medicine_ambulance',
      urgency: 'high',
      description: 'হৃদরোগে আক্রান্ত রোগীকে অবিলম্বে লাইফ সাপোর্টসহ উন্নত চিকিৎসার জন্য বরিশাল শের-ই-বাংলা মেডিকেল কলেজ হাসপাতালে স্থানান্তরে অ্যাম্বুলেন্স প্রয়োজন।',
      status: 'resolved',
      assignedVolunteer: {
        user: volunteerUser._id,
        name: 'তানভীর হোসেন',
        phone: '01712-998877'
      },
      responses: [
        {
          responder: volunteerUser._id,
          responderName: 'তানভীর হোসেন',
          responderRole: 'অ্যাম্বুলেন্স সমন্বয়ক',
          message: 'WCC জরুরি অ্যাম্বুলেন্সযোগে রোগীকে নিরাপদে বরিশাল মেডিকেলের সিসিইউতে স্থানান্তর ও ভর্তি সম্পন্ন করা হয়েছে।',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ],
      requester: {
        name: 'জাহিদুল ইসলাম',
        phone: '01955-443322'
      }
    },
    {
      patientName: 'রহিমা আক্তার (২৮ বছর)',
      hospital: 'অন্যান্য হাসপাতাল',
      ward: 'নলছিটি আধুনিক ক্লিনিক ও ডায়াগনস্টিক সেন্টার',
      contactName: 'মোঃ বাবুল হোসেন (স্বামী)',
      contactPhone: '01766-332211',
      emergencyType: 'blood',
      urgency: 'high',
      description: 'জরুরি সিজারিয়ান অপারেশনের জন্য ১ ব্যাগ O+ (ও পজিটিভ) রক্তের প্রয়োজন।',
      status: 'resolved',
      assignedVolunteer: {
        user: memberUser._id,
        name: 'রফিকুল ইসলাম',
        phone: '01812-445566'
      },
      responses: [
        {
          responder: memberUser._id,
          responderName: 'রফিকুল ইসলাম',
          responderRole: 'ব্লাড ডোনার লিড',
          message: 'ডোনার ফারহানা তাবাসসুম তাৎক্ষণিক রক্তদান করেছেন। মা ও নবজাতক দুজনই আলহামদুলিল্লাহ সুস্থ আছেন।',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      ],
      requester: {
        name: 'মোঃ বাবুল হোসেন',
        phone: '01766-332211'
      }
    },
    {
      patientName: 'মোঃ জহিরুল ইসলাম (৫০ বছর)',
      hospital: 'ঝালকাঠি সদর হাসপাতাল',
      ward: 'পুরুষ ওয়ার্ড - বেড নং ৮',
      contactName: 'নাজমুল আলম',
      contactPhone: '01877-221100',
      emergencyType: 'oxygen_bed',
      urgency: 'critical',
      description: 'তীব্র অ্যাজমা অ্যাটাকের কারণে বাসায় রোগী খুবই অসুস্থ। তাৎক্ষণিক একটি অক্সিজেন সিলিন্ডার ও ফ্লোমিটার সাপোর্ট প্রয়োজন।',
      status: 'pending',
      responses: [],
      requester: {
        name: 'নাজমুল আলম',
        phone: '01877-221100'
      }
    },
    {
      patientName: 'সুলতানা পারভীন (৫৫ বছর)',
      hospital: 'ঝালকাঠি সদর হাসপাতাল',
      ward: 'জরুরি বিভাগ',
      contactName: 'রিফাত হোসেন',
      contactPhone: '01988-112233',
      emergencyType: 'financial_help',
      urgency: 'moderate',
      description: 'অসচ্ছল পরিবারের সদস্যের সাপে কাটার পর জরুরি অ্যান্টিভেনম ও ইনজেকশন কেনার আর্থিক সাহায্য ও রক্ত পরীক্ষার সহায়তা।',
      status: 'pending',
      responses: [],
      requester: {
        name: 'রিফাত হোসেন',
        phone: '01988-112233'
      }
    }
  ];

  for (const er of emergencyRequestsData) {
    await EmergencyRequest.create(er);
  }
  console.log(`  ✓ Created ${emergencyRequestsData.length} Emergency Hospital Requests with live responses.`);

  // ---------------------------------------------------------------------------
  // 7. Education Wing: Free Member Courses & Lessons
  // ---------------------------------------------------------------------------
  console.log('\n[8/15] Seeding Education Wing Free Courses & Lessons...');
  const eduWing = wingDocs['education'];
  await Course.deleteMany({ wing: eduWing._id }); // Refresh education courses

  const coursesData = [
    {
      title: 'ফ্রি ওয়েব ডেভেলপমেন্ট ও ফ্রন্টএন্ড মাস্টারি (HTML, CSS, JS)',
      slug: 'web-development-frontend-mastery',
      description: 'ঝালকাঠি ও সারাদেশের শিক্ষার্থীদের জন্য WCC শিক্ষা উইংয়ের বিশেষায়িত ফ্রি ওয়েব ডেভেলপমেন্ট কোর্স। কোনো পূর্ব অভিজ্ঞতা ছাড়াই প্রফেশনাল ফ্রন্টএন্ড কোডিং ও আধুনিক ওয়েবসাইট তৈরি শিখুন।',
      wing: eduWing._id,
      wingSlug: 'education',
      category: 'Web Development',
      level: 'Beginner',
      duration: '৬ সপ্তাহ (১২টি প্র্যাকটিক্যাল লেকচার)',
      thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=800',
      instructor: {
        name: 'তানভীর আহমেদ চৌধুরী',
        title: 'সফটওয়্যার ইঞ্জিনিয়ার ও শিক্ষা উইং লিডার',
        organization: 'উই ক্যান চেঞ্জ (WCC)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      },
      lessons: [
        {
          title: 'মডিউল ১: ওয়েব পরিচিতি ও HTML5 ফাউন্ডেশন',
          description: 'ইন্টারনেট কীভাবে কাজ করে এবং ওয়েবসাইট তৈরির মূল কাঠামো HTML5 এর ব্যবহারিক ধারণা।',
          videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg',
          duration: '৪৫ মিনিট',
          order: 1
        },
        {
          title: 'মডিউল ২: আধুনিক CSS3 ও রেসপন্সিভ লেআউট',
          description: 'Flexbox, Grid এবং আধুনিক ওয়েবসাইট ডিজাইন টেকনিক।',
          videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
          duration: '৫৫ মিনিট',
          order: 2
        },
        {
          title: 'মডিউল ৩: JavaScript এর প্রাথমিক প্রোগ্রামিং লজিক',
          description: 'Variables, Functions, Arrays, Objects ও DOM ম্যানিপুলেশন।',
          videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
          duration: '৬০ মিনিট',
          order: 3
        }
      ],
      enrolledMembers: [volunteerUser._id, memberUser._id],
      status: 'published',
      createdBy: adminUser?._id
    },
    {
      title: 'স্পোকেন ইংলিশ অ্যান্ড প্রফেশনাল কমিউনিকেশন স্কিলস',
      slug: 'spoken-english-professional-communication',
      description: 'দৈনন্দিন কথোপকথন, ইন্টারভিউ ও উচ্চশিক্ষার জন্য স্পষ্ট ও আত্মবিশ্বাসী ইংরেজি বলার কৌশল। সকল WCC মেম্বারদের জন্য শতভাগ ফ্রি স্কিল ট্রেনিং।',
      wing: eduWing._id,
      wingSlug: 'education',
      category: 'Language & Communication',
      level: 'All Levels',
      duration: '৪ সপ্তাহ',
      thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800',
      instructor: {
        name: 'নুসরাত জাহান মীম',
        title: 'ভাষা ও যোগাযোগ প্রশিক্ষক',
        organization: 'উই ক্যান চেঞ্জ',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
      },
      lessons: [
        {
          title: 'ক্লাস ১: আত্মবিশ্বাসের সাথে ইংরেজি কথোপকথন শুরু করার কৌশল',
          description: 'Introduction, Ice-breaking and daily greeting practice in fluent English.',
          videoUrl: 'https://www.youtube.com/embed/juKd26qkNAw',
          duration: '৪০ মিনিট',
          order: 1
        },
        {
          title: 'ক্লাস ২: প্রফেশনাল ইমেইল ও প্রেজেন্টেশন স্কিলস',
          description: 'স্মার্টলি বিজনেস ইমেইল লেখা এবং পাবলিক স্পিকিং আর্ট।',
          videoUrl: 'https://www.youtube.com/embed/7X8II6J-6mU',
          duration: '৫০ মিনিট',
          order: 2
        }
      ],
      enrolledMembers: [memberUser._id],
      status: 'published',
      createdBy: adminUser?._id
    },
    {
      title: 'গ্রাফিক্স ডিজাইন ও ডিজিটাল ফ্রিল্যান্সিং (Photoshop & Canva)',
      slug: 'graphics-design-digital-freelancing',
      description: 'সোশ্যাল মিডিয়া ব্যানার, লোগো ডিজাইন ও ক্যানভা প্রো মাস্টারি। ফ্রিল্যান্সিং মার্কেটপ্লেসে কাজ করার বাস্তবসম্মত গাইডলাইন।',
      wing: eduWing._id,
      wingSlug: 'education',
      category: 'Design & Creative',
      level: 'Beginner',
      duration: '৫ সপ্তাহ',
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
      instructor: {
        name: 'ফারহানা ইসলাম প্রীতি',
        title: 'ইউআই/ইউএক্স ডিজাইনার',
        organization: 'উই ক্যান চেঞ্জ',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      },
      lessons: [
        {
          title: 'লেসন ১: ক্যানভা দিয়ে আকর্ষণীয় সোশ্যাল মিডিয়া পোস্ট ডিজাইন',
          description: 'টাইপোগ্রাফি, কালার প্যালেট ও ব্যানার লেআউটের মূল নিয়ম।',
          videoUrl: 'https://www.youtube.com/embed/un50Bs4BvZ8',
          duration: '৩৫ মিনিট',
          order: 1
        },
        {
          title: 'লেসন ২: অ্যাডোবি ফটোশপ বেসিক ও টুলস পরিচিতি',
          description: 'লেয়ার, মাস্কিং, পেন টুল ও ব্যাকগ্রাউন্ড রিমুভাল টেকনিক।',
          videoUrl: 'https://www.youtube.com/embed/IyR_uYsRdPs',
          duration: '৪৫ মিনিট',
          order: 2
        }
      ],
      enrolledMembers: [volunteerUser._id],
      status: 'published',
      createdBy: adminUser?._id
    },
    {
      title: 'বেসিক কম্পিউটার, ডাটা এন্ট্রি ও অফিস অ্যাপ্লিকেশন (Word & Excel)',
      slug: 'basic-computer-data-entry-office-applications',
      description: 'সরকারি ও বেসরকারি চাকরির জন্য অপরিহার্য মাইক্রোসফট ওয়ার্ড, এক্সেল ফর্মুলা ও প্রফেশনাল প্রেজেন্টেশন স্লাইড তৈরির এ টু জেড।',
      wing: eduWing._id,
      wingSlug: 'education',
      category: 'Office Productivity',
      level: 'Beginner',
      duration: '৪ সপ্তাহ',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      instructor: {
        name: 'মোঃ আরিফুল ইসলাম',
        title: 'ডাটা অ্যানালিস্ট ও ট্রেইনার',
        organization: 'উই ক্যান চেঞ্জ',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
      },
      lessons: [
        {
          title: 'লেকচার ১: এমএস ওয়ার্ড ডকুমেন্টস টাইপিং ও ফরম্যাটিং',
          description: 'সিভি তৈরি, অফিশিয়াল চিঠি ও প্যারাগ্রাফ স্টাইলিং।',
          videoUrl: 'https://www.youtube.com/embed/S-nHYzK-BVg',
          duration: '৪০ মিনিট',
          order: 1
        },
        {
          title: 'লেকচার ২: এক্সেল ফাংশন ও হিসাব-নিকাশ (SUM, AVERAGE, IF)',
          description: 'স্প্রেডশিট ডেটা এন্ট্রি ও স্বয়ংক্রিয় ফর্মুলা প্রয়োগ।',
          videoUrl: 'https://www.youtube.com/embed/Vl0H-qTclOg',
          duration: '৫০ মিনিট',
          order: 2
        }
      ],
      enrolledMembers: [memberUser._id],
      status: 'published',
      createdBy: adminUser?._id
    },
    {
      title: 'পাইথন প্রোগ্রামিং ও প্রবলেম সলভিং ফাউন্ডেশন',
      slug: 'python-programming-problem-solving-foundation',
      description: 'সহজ ভাষায় প্রোগ্রামিং শেখার জন্য পাইথন। স্কুল-কলেজ শিক্ষার্থী ও কোডিংয়ে আগ্রহী সবার জন্য উপযুক্ত হ্যান্ডস-অন কোর্স।',
      wing: eduWing._id,
      wingSlug: 'education',
      category: 'Software Engineering',
      level: 'Beginner',
      duration: '৬ সপ্তাহ',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
      instructor: {
        name: 'তানভীর আহমেদ চৌধুরী',
        title: 'সফটওয়্যার ইঞ্জিনিয়ার ও শিক্ষা উইং লিডার',
        organization: 'উই ক্যান চেঞ্জ (WCC)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      },
      lessons: [
        {
          title: 'পর্ব ১: পাইথন ইন্সটলেশন ও ভ্যারিয়েবল ধারণা',
          description: 'পাইথন সেটআপ, ইনপুট-আউটপুট এবং বেসিক ম্যাথ অপারেশন।',
          videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
          duration: '৪৫ মিনিট',
          order: 1
        },
        {
          title: 'পর্ব ২: কন্ডিশনাল লজিক ও লুপ (If-Else & While/For)',
          description: 'লজিকাল সিদ্ধান্ত ও পুনরাবৃত্তিমূলক কাজের লুপ টেকনিক।',
          videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
          duration: '৫০ মিনিট',
          order: 2
        }
      ],
      enrolledMembers: [volunteerUser._id],
      status: 'published',
      createdBy: adminUser?._id
    }
  ];

  for (const c of coursesData) {
    await Course.create(c);
  }
  console.log(`  ✓ Created ${coursesData.length} Free Member Courses with Lessons.`);

  // ---------------------------------------------------------------------------
  // 8. Education Wing: Book Library & Donations
  // ---------------------------------------------------------------------------
  console.log('\n[9/15] Seeding Book Library & Donation Listings...');
  await Book.deleteMany({}); // Refresh books
  const booksData = [
    {
      title: 'উচ্চ মাধ্যমিক পদার্থবিজ্ঞান (১ম পত্র)',
      author: 'প্রফেসর ড. শাহজাহান তপন',
      edition: '২০২৪ সংস্করণ',
      category: 'School/College Academic',
      condition: 'Like New',
      language: 'বাংলা',
      description: 'এইচএসসি বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য অত্যন্ত উপযোগী। বইটিতে কোনো দাগ নেই, একদম নতুন অবস্থা।',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'ঝালকাঠি সরকারি কলেজ সংলগ্ন, ঝালকাঠি',
      donor: {
        userId: volunteerUser._id,
        name: 'তানভীর চৌধুরী',
        phone: '01711-234567',
        email: 'tanvir.chowdhury@example.com'
      },
      status: 'approved',
      approvedBy: adminUser?._id,
      approvedAt: new Date()
    },
    {
      title: 'প্রফেসর’স বিসিএস প্রিলিমিনারি ডাইজেস্ট',
      author: 'প্রফেসর’স প্রকাশনী',
      edition: '৪৬তম বিসিএস বিশেষ সংস্করণ',
      category: 'BCS & Competitive Exams',
      condition: 'Good',
      language: 'বাংলা',
      description: 'চাকরি প্রত্যাশী যেকোনো অসচ্ছল ভাই-বোনের জন্য উপহার। ঝালকাঠি সদর থেকে সংগ্রহ করা যাবে।',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'পশ্চিম চাঁদকাঠি, ঝালকাঠি পৌরসভা',
      donor: {
        userId: memberUser._id,
        name: 'সুমাইয়া আক্তার',
        phone: '01812-987654',
        email: 'member@wecanchange.org'
      },
      status: 'approved',
      approvedBy: adminUser?._id,
      approvedAt: new Date()
    },
    {
      title: 'সবার জন্য পাইথন প্রোগ্রামিং',
      author: 'তামিম শাহরিয়ার সুবিন',
      edition: '৪র্থ মুদ্রণ',
      category: 'Science & Technology',
      condition: 'New',
      language: 'বাংলা',
      description: 'সহজ ভাষায় প্রোগ্রামিং শেখার চমৎকার বই। শিক্ষার্থীরা বিনামূল্যে রিকোয়েস্ট করতে পারেন।',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'কলেজ রোড, ঝালকাঠি',
      donor: {
        userId: volunteerUser._id,
        name: 'তানভীর আহমেদ',
        phone: '01711-000000',
        email: 'tanvir@example.com'
      },
      status: 'approved',
      approvedBy: adminUser?._id,
      approvedAt: new Date()
    },
    {
      title: 'একাত্তরের দিনগুলি',
      author: 'জাহানারা ইমাম',
      edition: 'চিরায়ত সংস্করণ',
      category: 'History & Culture',
      condition: 'Like New',
      language: 'বাংলা',
      description: 'আমাদের মুক্তিযুদ্ধের অমর স্মৃতিচারণমূলক উপন্যাস। যেকোনো শিক্ষার্থী পড়ার জন্য নিতে পারবেন।',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'প্রেসক্লাব সংলগ্ন, ঝালকাঠি সদর',
      donor: {
        userId: memberUser._id,
        name: 'রফিকুল ইসলাম',
        phone: '01812-445566',
        email: 'member@wecanchange.org'
      },
      status: 'approved',
      approvedBy: adminUser?._id,
      approvedAt: new Date()
    },
    {
      title: 'উচ্চ মাধ্যমিক উচ্চতর গণিত (১ম ও ২য় পত্র)',
      author: 'এস ইউ আহাম্মদ ও এম এ জব্বার',
      edition: '২০২৩ সংস্করণ',
      category: 'School/College Academic',
      condition: 'Good',
      language: 'বাংলা',
      description: 'গণিতে দুর্বল শিক্ষার্থীদের জন্য দুটি বই একসাথে উপহার হিসেবে দেওয়া হবে।',
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'নলছিটি পৌর বাসস্ট্যান্ড',
      donor: {
        userId: volunteerUser._id,
        name: 'মোঃ আরিফুল ইসলাম',
        phone: '01914-778899',
        email: 'ariful.islam@example.com'
      },
      status: 'approved',
      approvedBy: adminUser?._id,
      approvedAt: new Date()
    },
    {
      title: 'ছোটদের রবীন্দ্রনাথ সমগ্র (রঙিন সচিত্র)',
      author: 'রবীন্দ্রনাথ ঠাকুর',
      edition: 'বিশেষ সচিত্র মুদ্রণ',
      category: 'Children & Literature',
      condition: 'Like New',
      language: 'বাংলা',
      description: 'শিশুদের পড়ার জন্য উপযোগী সুন্দর গল্প ও কবিতার সংকলন।',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'কাঠপট্টি খেয়াঘাট রোড',
      donor: {
        userId: memberUser._id,
        name: 'সাদিয়া আক্তার রিমা',
        phone: '01819-334455',
        email: 'sadia.rima@example.com'
      },
      status: 'approved',
      approvedBy: adminUser?._id,
      approvedAt: new Date()
    },
    // 2 PENDING BOOKS FOR WING LEADER MODERATION DEMO:
    {
      title: 'অ্যাডভান্সড স্পোকেন ইংলিশ ভোকাবুলারি অ্যান্ড ইডিয়মস',
      author: 'সাইফুর রহমান খান',
      edition: '২০২৫ সংস্করণ',
      category: 'Language & Communication',
      condition: 'Like New',
      language: 'ইংরেজি ও বাংলা',
      description: 'আইইএলটিএস ও চাকরির ভাইভার জন্য চমৎকার বই। একজন সদস্যের পড়াশোনা শেষ হওয়ায় দান করতে চান।',
      coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'ঝালকাঠি সরকারি উচ্চ বিদ্যালয় রোড',
      donor: {
        userId: memberUser._id,
        name: 'নাজমুল হাসান',
        phone: '01799-887766',
        email: 'nazmul@example.com'
      },
      status: 'pending' // Wing leader review queue
    },
    {
      title: 'সাধারণ জ্ঞান বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী ২০২৬',
      author: 'আজকের বিশ্ব প্রকাশনী',
      edition: '২০২৬ আপডেট সংস্করণ',
      category: 'BCS & Competitive Exams',
      condition: 'New',
      language: 'বাংলা',
      description: 'বিশ্ববিদ্যালয় ভর্তি ও নিয়োগ পরীক্ষার প্রস্তুতিমূলক নতুন বই। অসচ্ছল শিক্ষার্থীকে প্রদানযোগ্য।',
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600',
      pickupLocation: 'রূপাতলী মোড়',
      donor: {
        userId: volunteerUser._id,
        name: 'ফারহানা ইসলাম',
        phone: '01733-112233',
        email: 'farhana@example.com'
      },
      status: 'pending' // Wing leader review queue
    }
  ];

  const createdBooks = [];
  for (const b of booksData) {
    const doc = await Book.create(b);
    createdBooks.push(doc);
  }
  console.log(`  ✓ Created ${createdBooks.length} Books in Library (including pending queue for moderation).`);

  // ---------------------------------------------------------------------------
  // 9. Education Wing: Member Book Requests
  // ---------------------------------------------------------------------------
  console.log('\n[10/15] Seeding Member Book Borrow Requests...');
  await BookRequest.deleteMany({}); // Refresh requests
  const bookRequestsData = [
    {
      book: createdBooks[0]._id, // Physics
      requester: {
        userId: memberUser._id,
        name: 'সুমাইয়া আক্তার',
        phone: '01812-987654',
        email: 'member@wecanchange.org',
        memberId: 'WCC-MEM-0001'
      },
      reason: 'আমি ঝালকাঠি সরকারি মহিলা কলেজের এইচএসসি ১ম বর্ষের ছাত্রী। আমার পরিবারের পক্ষে বিজ্ঞান বিভাগের সকল বই কেনা সম্ভব নয় বিধায় বইটি পড়ার জন্য দরকার।',
      deliveryAddress: 'পশ্চিম চাঁদকাঠি, ঝালকাঠি সদর',
      contactPhone: '01812-987654',
      status: 'pending' // Pending leader approval
    },
    {
      book: createdBooks[1]._id, // BCS Digest
      requester: {
        userId: volunteerUser._id,
        name: 'তানভীর হোসেন',
        phone: '01712-998877',
        email: 'volunteer@wecanchange.org',
        memberId: 'WCC-VOL-0001'
      },
      reason: 'আগামী বিসিএস প্রিলিমিনারি পরীক্ষার প্রস্তুতির জন্য বইটি ১ মাসের জন্য ধার নিতে চাই। যত্নসহকারে পড়ে যথাসময়ে ফেরত দেব।',
      deliveryAddress: 'বাসস্ট্যান্ড রোড, ঝালকাঠি সদর',
      contactPhone: '01712-998877',
      status: 'approved',
      reviewedBy: eduLeader?._id || adminUser?._id,
      adminNotes: 'অনুমোদিত। ঝালকাঠি সদর অফিস থেকে সংগ্রহ করার জন্য অনুরোধ করা হলো।',
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      book: createdBooks[2]._id, // Python Programming
      requester: {
        userId: memberUser._id,
        name: 'সাদিয়া আক্তার রিমা',
        phone: '01819-334455',
        email: 'sadia.rima@example.com',
        memberId: 'WCC-2026-0006'
      },
      reason: 'WCC ওয়েব ডেভেলপমেন্ট ও পাইথন কোর্সের পাশাপাশি বইটি অনুশীলন করতে চাই।',
      deliveryAddress: 'কাঠপট্টি খেয়াঘাট রোড, ঝালকাঠি',
      contactPhone: '01819-334455',
      status: 'completed',
      reviewedBy: eduLeader?._id || adminUser?._id,
      adminNotes: 'বইটি ডেলিভারি সম্পন্ন হয়েছে।',
      reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      book: createdBooks[3]._id, // Ekattorer Dinguli
      requester: {
        userId: volunteerUser._id,
        name: 'মোঃ আরিফুল ইসলাম',
        phone: '01914-778899',
        email: 'ariful.islam@example.com',
        memberId: 'WCC-2026-0007'
      },
      reason: 'মুক্তিযুদ্ধের ইতিহাস চর্চা ক্লাবের পাঠচক্রের জন্য বইটি ৩ সপ্তাহের জন্য প্রয়োজন।',
      deliveryAddress: 'নলছিটি পৌরসভা সংলগ্ন',
      contactPhone: '01914-778899',
      status: 'pending' // Pending leader approval
    },
    {
      book: createdBooks[4]._id, // Higher Math
      requester: {
        userId: memberUser._id,
        name: 'মেহেদী হাসান শুভ',
        phone: '01788-332211',
        email: 'mehedi.shuvo@example.com',
        memberId: 'WCC-2026-4412'
      },
      reason: 'এইচএসসি গণিত অনুশীলনের জন্য বইটি প্রয়োজন।',
      deliveryAddress: 'রাজাপুর বাজার মোড়',
      contactPhone: '01788-332211',
      status: 'rejected',
      reviewedBy: eduLeader?._id || adminUser?._id,
      rejectionReason: 'দুঃখিত, বইটি বর্তমানে রাজাপুরের অন্য একজন পরীক্ষার্থীকে প্রদান করা হয়েছে।',
      adminNotes: 'পরবর্তী এডিশন আসলে অগ্রাধিকার পাবেন।',
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const br of bookRequestsData) {
    await BookRequest.create(br);
  }
  console.log(`  ✓ Created ${bookRequestsData.length} Book Borrow Requests across statuses.`);

  // ---------------------------------------------------------------------------
  // 10. Member Requests: Wing Transfers for EVERY Wing & Volunteer Apps
  // ---------------------------------------------------------------------------
  console.log('\n[11/15] Seeding Member Requests (Wing Transfers for ALL 5 Wings)...');
  const wingRequestList = [
    {
      memberId: 'WCC-2026-0001',
      memberName: 'তানভীর আহমেদ চৌধুরী',
      memberEmail: 'tanvir.chowdhury@example.com',
      type: 'wing_change',
      currentWing: 'সাধারণ উইং',
      requestedWing: 'শিক্ষা উইং',
      reason: 'ঝালকাঠির প্রত্যন্ত অঞ্চলের শিক্ষার্থীদের জন্য লাইব্রেরি ও স্কিল ডেভেলপমেন্ট কোর্সে সরাসরি মেন্টর হিসেবে কাজ করতে চাই।',
      status: 'pending'
    },
    {
      memberId: 'WCC-MEM-0001',
      memberName: 'রফিকুল ইসলাম',
      memberEmail: 'member@wecanchange.org',
      type: 'wing_change',
      currentWing: 'সাধারণ উইং',
      requestedWing: 'স্বাস্থ্য উইং',
      reason: 'আমি একজন নিয়মিত রক্তদাতা এবং হাসপাতালে জরুরি রোগী সেবায় নিজেকে নিবেদিত করতে ইচ্ছুক।',
      status: 'pending'
    },
    {
      memberId: 'WCC-2026-6316',
      memberName: 'রিদওয়ানুর রহমান রাফি',
      memberEmail: 'ridwanoorrahmanrafi@gmail.com',
      type: 'wing_change',
      currentWing: 'সাধারণ উইং',
      requestedWing: 'খেলাধুলা উইং',
      reason: 'মাদকবিরোধী সমাজ গঠন ও তৃণমূলের তরুণদের জন্য ফুটবল-ক্রিকেট টুর্নামেন্ট সমন্বয়ের অভিজ্ঞতা রয়েছে।',
      status: 'pending'
    },
    {
      memberId: 'WCC-2026-3002',
      memberName: 'মোহাইমিনুল ইসলাম',
      memberEmail: 'mohaiminulislam0769@gmail.com',
      type: 'wing_change',
      currentWing: 'সাধারণ উইং',
      requestedWing: 'সংস্কৃতি উইং',
      reason: 'বাংলা সাহিত্য ও সাংস্কৃতিক বিতর্ক ক্লাব সক্রিয় করার জন্য সংস্কৃতি উইংয়ে যুক্ত হতে আগ্রহী।',
      status: 'pending'
    },
    {
      memberId: 'WCC-2026-3643',
      memberName: 'আহসান হাবিব',
      memberEmail: 'habib.green@example.com',
      type: 'wing_change',
      currentWing: 'সাধারণ উইং',
      requestedWing: 'পরিবেশ উইং',
      reason: 'সুগন্ধা নদী ভাঙন রোধ ও নদী তীরবর্তী ৫ হাজার ফলদ বৃক্ষরোপণ প্রকল্পে সরাসরি নেতৃত্ব দিতে চাই।',
      status: 'approved',
      adminNotes: 'অনুমোদিত। পরিবেশ রক্ষা কার্যক্রমে স্বাগত।',
      reviewedBy: 'WCC Administrator',
      reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      memberId: 'WCC-2026-7821',
      memberName: 'সাদিয়া আক্তার রিমা',
      memberEmail: 'sadia.rima@example.com',
      type: 'become_volunteer',
      volunteerInterests: [
        'ফ্রি স্বাস্থ্য ও চক্ষু ক্যাম্প সহায়তা (Free Medical Camp Support)',
        'জরুরি রক্তদান ও ব্লাড ডোনেশন ক্যাম্প (Blood Donation Drives)'
      ],
      reason: 'আমি একজন একনিষ্ঠ সমাজকর্মী হিসেবে নিয়মিত মাঠপর্যায়ে সময় ও শ্রম দিতে ইচ্ছুক।',
      status: 'pending'
    },
    {
      memberId: 'WCC-VOL-9421',
      memberName: 'মোঃ কামরুল হাসান',
      memberEmail: 'kamrul.hasan@example.com',
      type: 'become_volunteer',
      volunteerInterests: [
        'পরিবেশ রক্ষা ও বৃক্ষরোপণ কর্মসূচি (Tree Plantation & Green Drives)',
        'বন্যা ও দুর্যোগে জরুরি ত্রাণ বিতরণ (Disaster & Flood Relief)'
      ],
      reason: 'দুর্যোগ ব্যবস্থাপনায় কাজ করার পূর্ব অভিজ্ঞতা আছে এবং রেড ক্রিসেন্টের প্রশিক্ষণ নিয়েছি।',
      status: 'approved',
      adminNotes: 'সাক্ষাৎকার সফল। ভলান্টিয়ার হিসেবে অনুমোদন দেওয়া হলো।',
      reviewedBy: 'WCC Administrator',
      reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const wr of wingRequestList) {
    const existing = await MemberRequest.findOne({ memberId: wr.memberId, type: wr.type, requestedWing: wr.requestedWing });
    if (!existing) {
      await MemberRequest.create(wr);
    }
  }
  console.log(`  ✓ Member requests seeded for all 5 wings and volunteer applications.`);

  // ---------------------------------------------------------------------------
  // 11. Volunteer Logs (Enriching total logged volunteer hours)
  // ---------------------------------------------------------------------------
  console.log('\n[12/15] Seeding Rich Volunteer Activity Logs...');
  const volunteerLogsData = [
    {
      userId: volunteerUser._id,
      userEmail: volunteerUser.email,
      volunteerName: volunteerUser.name,
      driveName: 'ঝালকাঠি সদর ফ্রি মেডিকেল ও চক্ষু শিবির ২০২৬',
      hours: 14,
      notes: 'রোগী রেজিস্ট্রেশন ডেস্ক ও প্রবীণদের চলাচলে দিনব্যাপী সরাসরি স্বেচ্ছাসেবক হিসেবে সহায়তা প্রদান।',
      date: new Date('2026-02-15')
    },
    {
      userId: volunteerUser._id,
      userEmail: volunteerUser.email,
      volunteerName: volunteerUser.name,
      driveName: 'নলছিটি শীতবস্ত্র ও কম্বল বিতরণ কর্মসূচি',
      hours: 12,
      notes: '৪০০টি পরিবারের মাঝে কম্বল প্যাকেট তৈরি ও বিতরণ সমন্বয়ে কাজ করেছি।',
      date: new Date('2026-01-10')
    },
    {
      userId: volunteerUser._id,
      userEmail: volunteerUser.email,
      volunteerName: volunteerUser.name,
      driveName: 'সুগন্ধা নদী তীর প্লাস্টিক বর্জ্য অপসারণ ও পরিচ্ছন্নতা ড্রাইভ',
      hours: 8,
      notes: '২ কিলোমিটার নদীর পাড় থেকে ৫০ বস্তা ক্ষতিকর পলিথিন ও প্লাস্টিক বর্জ্য সংগ্রহ করা হয়েছে।',
      date: new Date('2026-02-28')
    },
    {
      userId: memberUser._id,
      userEmail: memberUser.email,
      volunteerName: memberUser.name,
      driveName: 'জরুরি স্বেচ্ছায় রক্তদান ও ডোনার রেজিস্ট্রেশন ক্যাম্পেইন',
      hours: 10,
      notes: 'ঝালকাঠি সদর হাসপাতালে ১০০ জনের বেশি রক্তদাতার ডাটাবেজ হালনাগাদ ও গ্রুপ নির্ণয় বুথ পরিচালনা।',
      date: new Date('2026-03-05')
    },
    {
      userId: memberUser._id,
      userEmail: memberUser.email,
      volunteerName: memberUser.name,
      driveName: 'ডায়াবেটিস ও হাইপারটেনশন ফ্রি স্বাস্থ্য ক্যাম্প',
      hours: 9,
      notes: 'রক্তচাপ ও গ্লুকোজ টেস্ট বুথে কিউ ব্যবস্থাপনার দায়িত্ব পালন।',
      date: new Date('2026-02-20')
    },
    {
      userId: volunteerUser._id,
      userEmail: volunteerUser.email,
      volunteerName: volunteerUser.name,
      driveName: 'WCC যুব ফুটবল টুর্নামেন্ট ২০২৬ গ্রাউন্ড ম্যানেজমেন্ট',
      hours: 16,
      notes: 'ঝালকাঠি স্টেডিয়ামে ম্যাচ রেফারি সহায়তা, ওয়াটার পয়েন্ট এবং ফার্স্ট এইড টিম পরিচালনা।',
      date: new Date('2026-03-12')
    },
    {
      userId: memberUser._id,
      userEmail: memberUser.email,
      volunteerName: memberUser.name,
      driveName: 'ফ্রি কম্পিউটার ও আইটি দক্ষতা কর্মশালা সহায়তা',
      hours: 8,
      notes: 'প্রেসক্লাব অডিটোরিয়ামে প্রশিক্ষণার্থীদের ল্যাপটপ কনফিগারেশন ও ক্লাসরুম ব্যবস্থাপনায় সহায়তা।',
      date: new Date('2026-03-01')
    }
  ];

  for (const vl of volunteerLogsData) {
    const exists = await VolunteerLog.findOne({ userEmail: vl.userEmail, driveName: vl.driveName });
    if (!exists) {
      await VolunteerLog.create(vl);
    }
  }
  console.log(`  ✓ Verified and added Volunteer Service Logs.`);

  // ---------------------------------------------------------------------------
  // 12. Finance: Advances, Reimbursements, Incomes, Expenses, Vendors
  // ---------------------------------------------------------------------------
  console.log('\n[13/15] Seeding Treasury Data (Advances, Reimbursements, Incomes, Expenses, Vendors)...');
  
  // 12a. Vendors
  const vendorsData = [
    {
      vendorId: 'WCC-VND-000001',
      name: 'মা মেডিক্যাল হল ও সার্জিক্যাল সাপ্লাইয়ার্স',
      serviceType: 'মেডিকেল ও ফার্মাসিউটিক্যালস',
      contactPerson: 'মোঃ আবুল কাশেম',
      phone: '01711-889900',
      email: 'ma.medical@example.com',
      address: 'সদর হাসপাতাল রোড, ঝালকাঠি',
      totalTransactions: 6,
      totalPaid: 145000,
      outstandingBalance: 0
    },
    {
      vendorId: 'WCC-VND-000002',
      name: 'মডার্ন প্রেস অ্যান্ড পাবলিকেশনস',
      serviceType: 'প্রিন্টিং ও স্টেশনারি',
      contactPerson: 'সাইফুল ইসলাম',
      phone: '01812-778899',
      email: 'modernpress.jhk@example.com',
      address: 'পশ্চিম চাঁদকাঠি, ঝালকাঠি',
      totalTransactions: 8,
      totalPaid: 65000,
      outstandingBalance: 5000
    },
    {
      vendorId: 'WCC-VND-000003',
      name: 'গ্রীন আর্থ নার্সারি ও এগ্রো সেন্টার',
      serviceType: 'চারাগাছ ও পরিবেশ সুরক্ষা সরঞ্জাম',
      contactPerson: 'মোখলেসুর রহমান',
      phone: '01915-445566',
      email: 'greenearth@example.com',
      address: 'রাজাপুর হাইওয়ে মোড়, ঝালকাঠি',
      totalTransactions: 4,
      totalPaid: 58000,
      outstandingBalance: 0
    },
    {
      vendorId: 'WCC-VND-000004',
      name: 'সাউন্ড অ্যান্ড লাইট ইভেন্ট সলিউশনস',
      serviceType: 'অডিও সাউন্ড ও প্যান্ডেল ডেকোরেশন',
      contactPerson: 'রাশেদ খলিফা',
      phone: '01725-334455',
      email: 'soundlight@example.com',
      address: 'পৌরসভা চত্বর, ঝালকাঠি',
      totalTransactions: 5,
      totalPaid: 42000,
      outstandingBalance: 0
    },
    {
      vendorId: 'WCC-VND-000005',
      name: 'বরিশাল স্পোর্টস ওয়ার্ল্ড',
      serviceType: 'ক্রীড়া সামগ্রী ও জার্সি প্রিন্ট',
      contactPerson: 'নাজমুল আলম',
      phone: '01833-112233',
      email: 'sports.barishal@example.com',
      address: 'সদর রোড, বরিশাল',
      totalTransactions: 3,
      totalPaid: 38000,
      outstandingBalance: 0
    }
  ];

  for (const v of vendorsData) {
    await Vendor.findOneAndUpdate({ vendorId: v.vendorId }, { $set: v }, { upsert: true });
  }

  // 12b. Advances
  const advancesData = [
    {
      advanceId: 'WCC-ADV-2026-000001',
      memberId: 'WCC-VOL-0001',
      memberName: 'তানভীর হোসেন',
      activityId: 'WCC-ACT-2026-000012',
      activityName: 'WCC Free Health Camp – Jhalokathi',
      purpose: 'ফ্রি মেডিকেল ক্যাম্পের জরুরি ওষুধ ও ব্যানার ডেকোরেশন খরচ অগ্রিম গ্রহণ',
      advanceAmount: 25000,
      disbursementDate: '2026-02-10',
      paymentMethod: 'Cash',
      accountId: 'WCC-ACC-000001',
      accountName: 'Cash in Hand (Main Vault)',
      paymentReference: 'VOUCHER-ADV-101',
      status: 'Settled',
      actualExpenseSubmitted: 25000,
      settlementBalance: 0,
      settlementType: 'Fully Settled',
      approvedBy: 'finance@wecanchange.org',
      notes: 'রশিদ দাখিল করা হয়েছে এবং অডিট সম্পন্ন।'
    },
    {
      advanceId: 'WCC-ADV-2026-000002',
      memberId: 'WCC-MEM-0001',
      memberName: 'রফিকুল ইসলাম',
      activityId: 'WCC-ACT-2026-000025',
      activityName: 'Green Jhalokathi Tree Plantation & Climate Drive',
      purpose: 'বন বিভাগ নার্সারি থেকে ৩,০০০ ফলদ চারা ক্রয় ও পরিবহন অগ্রিম',
      advanceAmount: 30000,
      disbursementDate: '2026-03-01',
      paymentMethod: 'Bank Transfer',
      accountId: 'WCC-ACC-000002',
      accountName: 'Main Bank Account (BRAC Bank PLC)',
      paymentReference: 'BRAC-TR-99881',
      status: 'Issued',
      actualExpenseSubmitted: 18000,
      settlementBalance: 12000,
      settlementType: 'Pending',
      approvedBy: 'finance@wecanchange.org',
      notes: 'প্রথম ধাপের চারা ক্রয় সম্পন্ন হয়েছে। বাকি চারা সংগ্রহের পর চূড়ান্ত রসিদ দাখিল করা হবে।'
    },
    {
      advanceId: 'WCC-ADV-2026-000003',
      memberId: 'WCC-2026-6316',
      memberName: 'রিদওয়ানুর রহমান রাফি',
      activityId: 'WCC-ACT-2026-000018',
      activityName: 'Youth IT Skills & Freelancing Bootcamp 2026',
      purpose: 'প্রেসক্লাব হলরুম ভাড়া ও প্রজেক্টর মাল্টিমিডিয়া বুকিং অগ্রিম',
      advanceAmount: 15000,
      disbursementDate: '2026-03-10',
      paymentMethod: 'bKash',
      accountId: 'WCC-ACC-000003',
      accountName: 'bKash Merchant / Donation Wallet',
      paymentReference: 'BKASH-ADV-7744',
      status: 'Issued',
      actualExpenseSubmitted: 0,
      settlementBalance: 15000,
      settlementType: 'Pending',
      approvedBy: 'finance@wecanchange.org',
      notes: 'বুটক্যাম্প শেষ হলে রসিদ সমন্বয় করা হবে।'
    }
  ];

  for (const a of advancesData) {
    await Advance.findOneAndUpdate({ advanceId: a.advanceId }, { $set: a }, { upsert: true });
  }

  // 12c. Reimbursements
  const reimbursementsData = [
    {
      reimbursementId: 'WCC-REIM-2026-000001',
      memberId: 'WCC-VOL-0001',
      memberName: 'তানভীর হোসেন',
      activityId: 'WCC-ACT-2026-000012',
      activityName: 'WCC Free Health Camp – Jhalokathi',
      category: 'Banner & Publicity',
      description: 'স্বাস্থ্য ক্যাম্পের জন্য ১০টি রোড ব্যানার ও দিকনির্দেশক সাইনবোর্ড তৈরি বাবদ পরিশোধ',
      amount: 4500,
      requestDate: '2026-02-18',
      approvalStatus: 'Paid',
      paymentDate: '2026-02-20',
      paymentMethod: 'Cash',
      accountId: 'WCC-ACC-000001',
      accountName: 'Cash in Hand (Main Vault)',
      approvedBy: 'finance@wecanchange.org',
      adminNotes: 'ভাউচার অনুমোদিত ও ক্যাশ পরিশোধ সম্পন্ন।'
    },
    {
      reimbursementId: 'WCC-REIM-2026-000002',
      memberId: 'WCC-MEM-0001',
      memberName: 'রফিকুল ইসলাম',
      activityId: 'WCC-ACT-2026-000012',
      activityName: 'WCC Free Health Camp – Jhalokathi',
      category: 'Logistics & Fuel',
      description: 'জরুরি অক্সিজেন সিলিন্ডার পরিবহন ও অ্যাম্বুলেন্স সিএনজি ফুয়েল খরচ',
      amount: 2800,
      requestDate: '2026-03-02',
      approvalStatus: 'Approved',
      paymentMethod: 'bKash',
      accountId: 'WCC-ACC-000003',
      accountName: 'bKash Merchant / Donation Wallet',
      approvedBy: 'finance@wecanchange.org',
      adminNotes: 'অনুমোদিত। আগামী পেমেন্ট সাইকেলে ব্যাংক/বিকাশ ট্রান্সফার হবে।'
    },
    {
      reimbursementId: 'WCC-REIM-2026-000003',
      memberId: 'WCC-2026-0006',
      memberName: 'সাদিয়া আক্তার রিমা',
      activityId: 'WCC-ACT-2026-000018',
      activityName: 'Youth IT Skills & Freelancing Bootcamp 2026',
      category: 'Refreshments & Hospitality',
      description: 'প্রশিক্ষণার্থীদের দুপুরের হালকা নাস্তা ও চা-বিস্কুট খরচ (৫০ জন)',
      amount: 3500,
      requestDate: '2026-03-15',
      approvalStatus: 'Verified',
      approvedBy: 'finance@wecanchange.org',
      adminNotes: 'রসিদ যাচাই সম্পন্ন হয়েছে, ট্রেজারার স্বাক্ষরের অপেক্ষায়।'
    },
    {
      reimbursementId: 'WCC-REIM-2026-000004',
      memberId: 'WCC-2026-0007',
      memberName: 'মোঃ আরিফুল ইসলাম',
      activityId: 'WCC-ACT-2026-000025',
      activityName: 'Green Jhalokathi Tree Plantation & Climate Drive',
      category: 'Gardening & Labor',
      description: 'নদী তীরের মাটি প্রস্তুত ও গর্ত খননে স্থানীয় দিনমজুর পারিশ্রমিক বিল',
      amount: 6000,
      requestDate: '2026-03-22',
      approvalStatus: 'Submitted',
      adminNotes: 'পর্যালোচনাধীন।'
    },
    {
      reimbursementId: 'WCC-REIM-2026-000005',
      memberId: 'WCC-2026-7821',
      memberName: 'মেহেদী হাসান',
      activityId: 'WCC-ACT-2026-000022',
      activityName: 'WCC Annual General Meeting & Executive Council 2026',
      category: 'Travel & Transportation',
      description: 'ব্যক্তিগত কাজে বরিশাল যাওয়া-আসার ভাড়ার রসিদ',
      amount: 1500,
      requestDate: '2026-03-10',
      approvalStatus: 'Rejected',
      approvedBy: 'finance@wecanchange.org',
      adminNotes: 'প্রকল্পের নীতিমালার বহির্ভূত হওয়ায় বাতিল করা হয়েছে।'
    }
  ];

  for (const r of reimbursementsData) {
    await Reimbursement.findOneAndUpdate({ reimbursementId: r.reimbursementId }, { $set: r }, { upsert: true });
  }

  // 12d. Income Entries
  const incomesData = [
    {
      incomeId: 'WCC-INC-2026-000005',
      date: '2026-02-05',
      incomeType: 'Donation',
      sourceOrDonor: 'ঝালকাঠি প্রবাসী কল্যাণ পরিষদ (ইউকে ও ইউএসএ চ্যাপ্টার)',
      activityId: 'WCC-ACT-2026-000012',
      activityName: 'WCC Free Health Camp – Jhalokathi',
      amount: 120000,
      paymentMethod: 'Bank Transfer',
      accountId: 'WCC-ACC-000002',
      accountName: 'Main Bank Account (BRAC Bank PLC)',
      referenceNo: 'TT-UK-889922',
      remarks: 'ফ্রি মেডিকেল ও চক্ষু শিবিরের সম্পূর্ণ ওষুধ স্পনসরশিপ অনুদান।'
    },
    {
      incomeId: 'WCC-INC-2026-000006',
      date: '2026-02-15',
      incomeType: 'Membership Fee',
      sourceOrDonor: 'ফেব্রুয়ারি ২০২৬ মাসিক সাধারণ সদস্য চাঁদা (৮০ জন সদস্য)',
      amount: 16000,
      paymentMethod: 'bKash',
      accountId: 'WCC-ACC-000003',
      accountName: 'bKash Merchant / Donation Wallet',
      referenceNo: 'BKASH-SUB-FEB26',
      remarks: 'সদস্যদের নিয়মিত মাসিক চাঁদা ২০০ টাকা হারে।'
    },
    {
      incomeId: 'WCC-INC-2026-000007',
      date: '2026-03-01',
      incomeType: 'Sponsorship',
      sourceOrDonor: 'প্রাইম ফার্মা ও লোকাল ডায়াগনস্টিক অ্যাসোসিয়েশন',
      activityId: 'WCC-ACT-2026-000018',
      activityName: 'Youth IT Skills & Freelancing Bootcamp 2026',
      amount: 40000,
      paymentMethod: 'Bank Transfer',
      accountId: 'WCC-ACC-000002',
      accountName: 'Main Bank Account (BRAC Bank PLC)',
      referenceNo: 'CHQ-778841',
      remarks: 'তরুণদের ডিজিটাল স্কিল বুটক্যাম্প স্পনসরশিপ।'
    },
    {
      incomeId: 'WCC-INC-2026-000008',
      date: '2026-03-12',
      incomeType: 'Donation',
      sourceOrDonor: 'হাজী আব্দুল ওয়াহেদ মেমোরিয়াল ট্রাস্ট (ঝালকাঠি)',
      amount: 50000,
      paymentMethod: 'Cash',
      accountId: 'WCC-ACC-000001',
      accountName: 'Cash in Hand (Main Vault)',
      referenceNo: 'MR-TRUST-2026',
      remarks: 'দরিদ্র ও মেধাবী শিক্ষার্থীদের শিক্ষাবৃত্তি তহবিল।'
    }
  ];

  for (const inc of incomesData) {
    await Income.findOneAndUpdate({ incomeId: inc.incomeId }, { $set: inc }, { upsert: true });
  }

  // 12e. Expense Entries
  const expensesData = [
    {
      expenseId: 'WCC-EXP-2026-000010',
      date: '2026-02-14',
      activityId: 'WCC-ACT-2026-000012',
      activityName: 'WCC Free Health Camp – Jhalokathi',
      submittedByName: 'তানভীর হোসেন',
      submittedByRole: 'ভলান্টিয়ার কো-অর্ডিনেটর',
      category: 'Medical Supplies & Medicines',
      description: 'মা মেডিকেল হল থেকে অ্যান্টিবায়োটিক, চোখের ড্রপ ও স্যালাইন ক্রয়',
      amount: 48500,
      paymentMethod: 'Bank Transfer',
      accountId: 'WCC-ACC-000002',
      accountName: 'Main Bank Account (BRAC Bank PLC)',
      paidBy: 'WCC Central Treasury',
      vendorOrMember: 'মা মেডিক্যাল হল ও সার্জিক্যাল সাপ্লাইয়ার্স',
      referenceNo: 'INV-MED-441',
      status: 'Paid',
      remarks: 'ক্যাম্পের জন্য ক্যাশলেস ব্যাংক পেমেন্ট সম্পন্ন।'
    },
    {
      expenseId: 'WCC-EXP-2026-000011',
      date: '2026-02-15',
      activityId: 'WCC-ACT-2026-000012',
      activityName: 'WCC Free Health Camp – Jhalokathi',
      submittedByName: 'রফিকুল ইসলাম',
      submittedByRole: 'লজিস্টিকস লিড',
      category: 'Stage, Tent & Sound',
      description: 'ডক্টরস বুথ, প্যান্ডেল ডেকোরেশন ও সাউন্ড সিস্টেম বিল',
      amount: 18000,
      paymentMethod: 'Cash',
      accountId: 'WCC-ACC-000001',
      accountName: 'Cash in Hand (Main Vault)',
      paidBy: 'Cash Vault',
      vendorOrMember: 'সাউন্ড অ্যান্ড লাইট ইভেন্ট সলিউশনস',
      referenceNo: 'VND-SND-901',
      status: 'Paid',
      remarks: 'পৌর পার্ক মাঠের ডেকোরেশন সম্পন্ন।'
    },
    {
      expenseId: 'WCC-EXP-2026-000012',
      date: '2026-03-08',
      activityId: 'WCC-ACT-2026-000025',
      activityName: 'Green Jhalokathi Tree Plantation & Climate Drive',
      submittedByName: 'মোঃ আরিফুল ইসলাম',
      submittedByRole: 'পরিবেশ উইং কো-অর্ডিনেটর',
      category: 'Seedlings & Plantation Gear',
      description: 'গ্রীন আর্থ নার্সারি থেকে আম, মেহগনি ও নিম গাছের ২,০০০ চারা ক্রয়',
      amount: 32000,
      paymentMethod: 'Bank Transfer',
      accountId: 'WCC-ACC-000002',
      accountName: 'Main Bank Account (BRAC Bank PLC)',
      paidBy: 'WCC Central Treasury',
      vendorOrMember: 'গ্রীন আর্থ নার্সারি ও এগ্রো সেন্টার',
      referenceNo: 'NURSERY-INV-552',
      status: 'Paid',
      remarks: 'সুগন্ধা নদীর বাঁধে রোপণ করা হচ্ছে।'
    },
    {
      expenseId: 'WCC-EXP-2026-000013',
      date: '2026-03-14',
      activityId: 'WCC-ACT-2026-000018',
      activityName: 'Youth IT Skills & Freelancing Bootcamp 2026',
      submittedByName: 'রিদওয়ানুর রহমান রাফি',
      submittedByRole: 'আইটি কো-অর্ডিনেটর',
      category: 'Venue & Facilities',
      description: 'প্রেসক্লাব অডিটোরিয়াম ৩ দিনের ভাড়া ও উচ্চগতির ব্রডব্যান্ড ইন্টারনেট সংযোগ বিল',
      amount: 12500,
      paymentMethod: 'bKash',
      accountId: 'WCC-ACC-000003',
      accountName: 'bKash Merchant / Donation Wallet',
      paidBy: 'bKash Wallet',
      vendorOrMember: 'ঝালকাঠি প্রেসক্লাব',
      referenceNo: 'PC-RENT-2026-3',
      status: 'Paid',
      remarks: '৫০ জন শিক্ষার্থীর ল্যাব ক্লাস চলমান।'
    }
  ];

  for (const exp of expensesData) {
    await Expense.findOneAndUpdate({ expenseId: exp.expenseId }, { $set: exp }, { upsert: true });
  }

  console.log('  ✓ Treasury accounts, advances, reimbursements, incomes, and expenses seeded successfully.');

  // ---------------------------------------------------------------------------
  // 13. Public Issues & Community Reports
  // ---------------------------------------------------------------------------
  console.log('\n[14/15] Seeding Community Reports & Public Issues...');
  const issuesData = [
    {
      issueCode: 'WCC-ISSUE-2026-001',
      title: 'সুগন্ধা নদী সংলগ্ন বিষখালী ঘাটে অবৈধ প্লাস্টিক বর্জ্য ও ময়লার স্তূপ',
      description: 'ঘাট সংলগ্ন বাজারে পর্যাপ্ত ডাস্টবিন না থাকায় পলিথিন ও পচা বর্জ্য সরাসরি নদীতে ফেলা হচ্ছে, যার ফলে দুর্গন্ধ ও পরিবেশ বিপর্যয় ঘটছে।',
      location: 'বিষখালী খেয়াঘাট, রাজাপুর, ঝালকাঠি',
      photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=800',
      status: 'in_progress',
      reporterName: 'মোঃ কামরুল হাসান',
      reporterContact: '01712-445566',
      wingId: wingDocs['environment']?._id,
      assignedTo: volunteerUser._id
    },
    {
      issueCode: 'WCC-ISSUE-2026-002',
      title: 'ঝালকাঠি সরকারি কলেজ রোডে বিপজ্জনক খানাখন্দ ও স্ট্রিট লাইট নষ্ট',
      description: 'কলেজ রোড ও লঞ্চঘাট সংযোগকারী প্রধান রাস্তায় একাধিক বড় গর্ত তৈরি হয়েছে এবং রাতে বাতি না থাকায় শিক্ষার্থী ও পথচারীরা দুর্ঘটনার শিকার হচ্ছেন।',
      location: 'কলেজ রোড সংলগ্ন পৌর পার্ক মোড়, ঝালকাঠি সদর',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
      status: 'pending',
      reporterName: 'ফারহানা তাবাসসুম',
      reporterContact: '01819-876543',
      wingId: wingDocs['environment']?._id
    },
    {
      issueCode: 'WCC-ISSUE-2026-003',
      title: 'নলছিটি পৌর স্বাস্থ্য কমপ্লেক্সে জরুরি অক্সিজেন সিলিন্ডার সংকট সমাধান',
      description: 'জরুরি বিভাগে শ্বাসকষ্টের রোগীদের জন্য পর্যাপ্ত অক্সিজেন ফ্লোমিটার ও সিলিন্ডার ছিল না। WCC ভলান্টিয়ার টিমের মাধ্যমে ২টি সিলিন্ডার প্রদান করা হয়েছে।',
      location: 'নলছিটি উপজেলা স্বাস্থ্য কমপ্লেক্স',
      photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      status: 'resolved',
      reporterName: 'ডা. সাজিদ আহমেদ',
      reporterContact: '01911-223344',
      wingId: wingDocs['health']?._id,
      assignedTo: healthLeader?._id || volunteerUser._id
    }
  ];

  for (const iss of issuesData) {
    await Issue.findOneAndUpdate({ issueCode: iss.issueCode }, { $set: iss }, { upsert: true });
  }
  console.log('  ✓ Public issues and community action reports seeded.');

  // ---------------------------------------------------------------------------
  // 14. Notifications
  // ---------------------------------------------------------------------------
  console.log('\n[15/15] Seeding System Notifications & Alerts...');
  const notificationsData = [
    {
      recipientUserId: volunteerUser._id,
      recipientEmail: volunteerUser.email,
      recipientName: volunteerUser.name,
      senderName: 'WCC Central Administration',
      type: 'role_invitation',
      title: 'স্বাস্থ্য উইং ইমার্জেন্সি রেসপন্স টিমে স্বাগতম!',
      message: 'আপনাকে ঝালকাঠি জেলা ইমার্জেন্সি সেল টিমে অ্যাম্বুলেন্স ও অক্সিজেন সিলিন্ডার সমন্বয়কের দায়িত্ব প্রদান করা হয়েছে।',
      targetRole: 'volunteer',
      targetWing: 'স্বাস্থ্য উইং (Health)',
      status: 'accepted'
    },
    {
      recipientUserId: memberUser._id,
      recipientEmail: memberUser.email,
      recipientName: memberUser.name,
      senderName: 'শিক্ষা উইং লিডার',
      type: 'announcement',
      title: 'শিক্ষা উইংয়ে নতুন ফ্রি কোর্স ও লাইব্রেরি বুক উন্মোচিত!',
      message: 'মেম্বারদের জন্য ফ্রি ওয়েব ডেভেলপমেন্ট, স্পোকেন ইংলিশ ও বুক লাইব্রেরি সুবিধা উন্মুক্ত করা হয়েছে। এখনই এনরোল করুন।',
      targetRole: 'volunteer',
      status: 'pending'
    },
    {
      recipientUserId: adminUser._id,
      recipientEmail: adminUser.email,
      recipientName: adminUser.name,
      senderName: 'ট্রেজারি ও অর্থ বিভাগ',
      type: 'general_alert',
      title: 'মাসিক অডিট ও রিম্বার্সমেন্ট রিকোয়েস্ট যাচাই',
      message: '৫টি নতুন রিম্বার্সমেন্ট ভাউচার পর্যালোচনার জন্য জমা পড়েছে। অনুগ্রহ করে ট্রেজারি প্যানেল চেক করুন।',
      targetRole: 'coordinator',
      status: 'pending'
    }
  ];

  for (const n of notificationsData) {
    const exists = await Notification.findOne({ recipientEmail: n.recipientEmail, title: n.title });
    if (!exists) {
      await Notification.create(n);
    }
  }
  console.log('  ✓ System Notifications verified.');

  console.log('\n================================================================');
  console.log('🎉 ALL 27+ MODULES POPULATED WITH PRESENTATION DATA SUCCESSFULLY!');
  console.log('================================================================\n');
};

// Run if called directly
if (process.argv[1]?.endsWith('seedAllPresentationData.js')) {
  seedAllPresentationData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Data population failed:', err);
      process.exit(1);
    });
}
