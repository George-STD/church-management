import { PrismaClient, Role, AccountStatus, FollowUpItemType, FollowUpTargetType, PrepStatus, YearPlanCategory, ScopeType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Church Service Management System...');

  // Clean existing tables in proper order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.privateNote.deleteMany();
  await prisma.yearPlanSignup.deleteMany();
  await prisma.yearPlanItem.deleteMany();
  await prisma.spiritualLifeEntry.deleteMany();
  await prisma.lessonPrep.deleteMany();
  await prisma.consecutiveAbsenceAlert.deleteMany();
  await prisma.followUpRecord.deleteMany();
  await prisma.followUpSession.deleteMany();
  await prisma.memberEvaluativeRecord.deleteMany();
  await prisma.memberServantAssignment.deleteMany();
  await prisma.servedMember.deleteMany();
  await prisma.transferHistory.deleteMany();
  await prisma.servantEvaluativeRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.sector.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 1. Create Sectors
  const sectors = [
    { id: 'sec-early-childhood', name: 'قطاع الطفولة المبكرة', description: 'يشمل حضانة وما قبل المدرسة' },
    { id: 'sec-primary', name: 'قطاع ابتدائي', description: 'يشمل صفوف المرحلة الابتدائية' },
    { id: 'sec-prep', name: 'قطاع اعدادي', description: 'يشمل صفوف المرحلة الإعدادية بنين وبنات' },
    { id: 'sec-secondary', name: 'قطاع ثانوي', description: 'يشمل صفوف المرحلة الثانوية بنين وبنات' },
    { id: 'sec-university', name: 'قطاع شباب وجامعة', description: 'يشمل طلبة الجامعات والخريجين' },
  ];

  for (const s of sectors) {
    await prisma.sector.create({ data: s });
  }
  console.log(`✅ Created ${sectors.length} Sectors.`);

  // 2. Create Stages
  const stages = [
    { id: 'stage-nursery', name: 'حضانة', sectorId: 'sec-early-childhood', orderIndex: 1, genderSplit: 'ALL' },
    { id: 'stage-primary-1-2', name: 'ابتدائي 1 و 2', sectorId: 'sec-primary', orderIndex: 2, genderSplit: 'ALL' },
    { id: 'stage-primary-3-4', name: 'ابتدائي 3 و 4', sectorId: 'sec-primary', orderIndex: 3, genderSplit: 'ALL' },
    { id: 'stage-primary-5-6', name: 'ابتدائي 5 و 6', sectorId: 'sec-primary', orderIndex: 4, genderSplit: 'ALL' },
    { id: 'stage-prep-boys', name: 'اعدادي بنين', sectorId: 'sec-prep', orderIndex: 5, genderSplit: 'BOYS' },
    { id: 'stage-prep-girls', name: 'اعدادي بنات', sectorId: 'sec-prep', orderIndex: 6, genderSplit: 'GIRLS' },
    { id: 'stage-secondary-boys', name: 'ثانوي بنين', sectorId: 'sec-secondary', orderIndex: 7, genderSplit: 'BOYS' },
    { id: 'stage-secondary-girls', name: 'ثانوي بنات', sectorId: 'sec-secondary', orderIndex: 8, genderSplit: 'GIRLS' },
    { id: 'stage-university', name: 'جامعة وخريجين', sectorId: 'sec-university', orderIndex: 9, genderSplit: 'ALL' },
  ];

  for (const st of stages) {
    await prisma.stage.create({ data: st });
  }
  console.log(`✅ Created ${stages.length} Stages.`);

  // 3. Create Users across all 5 hierarchical roles
  const defaultPasswordHash = await bcrypt.hash('Church@2026!', 10);

  // General Secretary
  const generalSecretary = await prisma.user.create({
    data: {
      id: 'user-gen-sec',
      phone: '01000000001',
      email: 'general@church.org',
      passwordHash: defaultPasswordHash,
      fullName: 'أستاذ نبيل كامل',
      fatherConfessor: 'القمص أنطونيوس صليب',
      address: 'مصر الجديدة، القاهرة',
      maritalStatus: 'MARRIED',
      spouseName: 'مريم جورج',
      educationCareerStage: 'GRADUATED',
      role: Role.GENERAL_SECRETARY,
      status: AccountStatus.ACTIVE,
    },
  });

  // Sector Secretary (Prep Sector)
  const sectorSecretary = await prisma.user.create({
    data: {
      id: 'user-sec-prep',
      phone: '01000000002',
      email: 'sector.prep@church.org',
      passwordHash: defaultPasswordHash,
      fullName: 'مهندس سامح يوسف',
      fatherConfessor: 'القس ميخائيل إبراهيم',
      address: 'مدينة نصر، القاهرة',
      maritalStatus: 'MARRIED',
      spouseName: 'سارة فريد',
      educationCareerStage: 'GRADUATED',
      role: Role.SECTOR_SECRETARY,
      sectorId: 'sec-prep',
      status: AccountStatus.ACTIVE,
    },
  });

  // Stage Secretary (Prep Boys)
  const stageSecretary = await prisma.user.create({
    data: {
      id: 'user-stage-prep-boys',
      phone: '01000000003',
      email: 'stage.prep.boys@church.org',
      passwordHash: defaultPasswordHash,
      fullName: 'أستاذ مينا موريس',
      fatherConfessor: 'القس يوحنا كمال',
      address: 'العباسية، القاهرة',
      maritalStatus: 'MARRIED',
      spouseName: 'كرستين رأفت',
      educationCareerStage: 'GRADUATED',
      role: Role.STAGE_SECRETARY,
      stageId: 'stage-prep-boys',
      sectorId: 'sec-prep',
      status: AccountStatus.ACTIVE,
    },
  });

  // Assistant Secretary (Prep Boys)
  const assistantSecretary = await prisma.user.create({
    data: {
      id: 'user-assistant-prep-boys',
      phone: '01000000004',
      email: 'assistant.prep.boys@church.org',
      passwordHash: defaultPasswordHash,
      fullName: 'أستاذ بيتر سمير',
      fatherConfessor: 'القس يوحنا كمال',
      address: 'شبرا، القاهرة',
      maritalStatus: 'ENGAGED',
      educationCareerStage: 'GRADUATED',
      role: Role.ASSISTANT_SECRETARY,
      stageId: 'stage-prep-boys',
      sectorId: 'sec-prep',
      status: AccountStatus.ACTIVE,
    },
  });

  // Servant (Prep Boys)
  const servant = await prisma.user.create({
    data: {
      id: 'user-servant-prep-boys',
      phone: '01000000005',
      email: 'servant.prep.boys@church.org',
      passwordHash: defaultPasswordHash,
      fullName: 'دكتور فادي كمال',
      fatherConfessor: 'القمص سوريال يوسف',
      address: 'حدائق القبة، القاهرة',
      maritalStatus: 'SINGLE',
      educationCareerStage: 'WORKING',
      role: Role.SERVANT,
      stageId: 'stage-prep-boys',
      sectorId: 'sec-prep',
      status: AccountStatus.ACTIVE,
    },
  });

  console.log('✅ Created 5 hierarchical Users (Password: Church@2026!).');

  // 4. Create Evaluative Records (SRS A1: Supervisor sets evaluative fields)
  // Stage Secretary evaluates Assistant & Servant
  await prisma.servantEvaluativeRecord.create({
    data: {
      servantId: servant.id,
      evaluatorId: stageSecretary.id,
      financialStatus: 'متوسط ومستقر',
      behaviorWithServed: 'ممتاز، حنون ومحب للأولاد ومستمع جيد',
      behaviorWithServants: 'متعاون جداً ويشارك في كافة الأنشطة',
      cooperation: 'درجة أولى، ملتزم بالمواعيد',
      individualWork: 'مبادر ويقترح أفكاراً إبداعية للدروس',
      periodNotes: 'خادم نشيط ومبشر بنمو روحي وخدمي كبير',
    },
  });

  // Sector Secretary evaluates Stage Secretary
  await prisma.servantEvaluativeRecord.create({
    data: {
      servantId: stageSecretary.id,
      evaluatorId: sectorSecretary.id,
      financialStatus: 'مستقر',
      behaviorWithServed: 'قائد قدوة ومحبوب من جميع المراحل',
      behaviorWithServants: 'حكيم وهادئ ويحل الأزمات بروح المحبة',
      cooperation: 'ممتاز في التنسيق مع أمين القطاع',
      individualWork: 'تنظيم استثنائي لجداول الخدمة وتدبير السنة',
    },
  });

  // General Secretary evaluates Sector Secretary
  await prisma.servantEvaluativeRecord.create({
    data: {
      servantId: sectorSecretary.id,
      evaluatorId: generalSecretary.id,
      financialStatus: 'مستقر ومقتدر',
      behaviorWithServed: 'قائد روحي وموجه تربوي رفيع المستوى',
      behaviorWithServants: 'محتضن لجميع أمناء المراحل والخدام',
      cooperation: 'حاضر دائماً في اجتماعات الأمانة العامة',
      individualWork: 'تطوير استراتيجية شاملة لقطاع إعدادي',
    },
  });

  console.log('✅ Created Servant Evaluative Records with proper hierarchy.');

  // 5. Create Served Members (المخدومين)
  const member1 = await prisma.servedMember.create({
    data: {
      id: 'member-1',
      fullName: 'مارك يوسف ناصف',
      fatherConfessor: 'القس يوحنا كمال',
      dateOfBirth: new Date('2012-05-14'),
      address: '15 شارع شبرا الرئيسي، القاهرة',
      phone: '01223344551',
      fatherName: 'يوسف ناصف عزيز',
      fatherAge: 46,
      motherName: 'ميرفت فهيم',
      motherAge: 42,
      schoolUniversity: 'مدرسة الفرير التجريبية بنين',
      educationalStage: 'الصف الثاني الإعدادي',
      stageId: 'stage-prep-boys',
      siblingsJson: [
        { name: 'جوي يوسف', age: 10 },
        { name: 'ديفيد يوسف', age: 7 },
      ],
    },
  });

  const member2 = await prisma.servedMember.create({
    data: {
      id: 'member-2',
      fullName: 'توماس شريف رفعت',
      fatherConfessor: 'القمص سوريال يوسف',
      dateOfBirth: new Date('2013-01-20'),
      address: '8 شارع جزيرة بدران، شبرا',
      phone: '01223344552',
      fatherName: 'شريف رفعت غالي',
      fatherAge: 48,
      motherName: 'ماري حنا',
      motherAge: 44,
      schoolUniversity: 'مدرسة التوفيقية الإعدادية بنين',
      educationalStage: 'الصف الأول الإعدادي',
      stageId: 'stage-prep-boys',
      siblingsJson: [{ name: 'مارينا شريف', age: 16 }],
    },
  });

  // Assign members to servant (د/ فادي كمال)
  await prisma.memberServantAssignment.createMany({
    data: [
      { memberId: member1.id, servantId: servant.id },
      { memberId: member2.id, servantId: servant.id },
    ],
  });

  // Servant adds evaluative fields for assigned members (FR-3.1 / A2)
  await prisma.memberEvaluativeRecord.create({
    data: {
      memberId: member1.id,
      servantId: servant.id,
      financialStatus: 'أسرة متوسطة الحال ولا تحتاج إلى مساعدة',
      behaviorInService: 'منتظم وهادئ ومشارك في الألحان',
      integrationWithOthers: 'مندمج سريعاً مع زملائه ومحبوب في الفصل',
      notes: 'يحتاج تشجيعاً في قراءة الكتاب المقدس بانتظام',
    },
  });

  console.log('✅ Created Served Members with Servant assignments and evaluations.');

  // 6. Create Follow-Up Session & Attendance
  const session = await prisma.followUpSession.create({
    data: {
      id: 'session-sample-1',
      date: new Date('2026-09-18'),
      title: 'خدمة الجمعة الأسبوعية - الأسبوع الثالث من توت',
      stageId: 'stage-prep-boys',
      sectorId: 'sec-prep',
      sessionType: 'SERVICE',
    },
  });

  // Servant attendance record
  await prisma.followUpRecord.createMany({
    data: [
      {
        sessionId: session.id,
        targetType: FollowUpTargetType.SERVANT,
        targetId: servant.id,
        itemType: FollowUpItemType.MASS,
        attended: true,
        recordedById: stageSecretary.id,
        date: new Date('2026-09-18'),
      },
      {
        sessionId: session.id,
        targetType: FollowUpTargetType.SERVANT,
        targetId: servant.id,
        itemType: FollowUpItemType.PREPARATION,
        attended: true,
        recordedById: stageSecretary.id,
        date: new Date('2026-09-18'),
      },
      {
        sessionId: session.id,
        targetType: FollowUpTargetType.SERVANT,
        targetId: servant.id,
        itemType: FollowUpItemType.SERVICE,
        attended: true,
        recordedById: stageSecretary.id,
        date: new Date('2026-09-18'),
      },
      {
        sessionId: session.id,
        targetType: FollowUpTargetType.SERVED_MEMBER,
        targetId: member1.id,
        itemType: FollowUpItemType.SERVICE,
        attended: true,
        recordedById: servant.id,
        date: new Date('2026-09-18'),
      },
      {
        sessionId: session.id,
        targetType: FollowUpTargetType.SERVED_MEMBER,
        targetId: member2.id,
        itemType: FollowUpItemType.SERVICE,
        attended: false,
        notes: 'مريض بنزلة برد، تم الاتصال بوالدته هاتفياً للاطمئنان',
        recordedById: servant.id,
        date: new Date('2026-09-18'),
      },
    ],
  });

  console.log('✅ Created Sample Attendance Session & Records.');

  // 7. Create Lesson Prep (تحضير)
  await prisma.lessonPrep.create({
    data: {
      authorId: servant.id,
      stageId: 'stage-prep-boys',
      date: new Date('2026-09-25'),
      topic: 'داود النبي ومواجهة جليات: الإيمان الذي يهزم الخوف',
      biblicalReference: '1 صموئيل 17',
      objectivesJson: [
        'أن يفهم المخدوم أن القوة الحقيقية تنبع من الاتكال على الله',
        'أن يتدرب على مواجهة الضغوط المحيطة بروح الثقة والصلاة',
        'أن يحفظ الشاهد والآية: "أَنْتَ تَأْتِي إِلَيَّ بِسَيْفٍ وَبِرُمْحٍ، وَأَنَا آتِي إِلَيْكَ بِاسْمِ رَبِّ الْجُنُودِ"',
      ],
      content: 'مقدمة تشويقية عن الفرق بين المظهر الخارجي وقوة القلب الداخلي...\nنقطة 1: تحدي جليات وخوف الجيش الإسرائيلي.\nنقطة 2: غيرة داود المقدسة وشجاعته...\nتطبيق عملي وألعاب حركية ومسابقات.',
      status: PrepStatus.APPROVED,
      reviewerId: stageSecretary.id,
      feedback: 'تحضير متميز وشامل، تم اعتماده لخدمة الأسبوع القادم.',
    },
  });

  // 8. Create Year Plan Items (تدبير السنة)
  await prisma.yearPlanItem.create({
    data: {
      title: 'مؤتمر شباب إعدادي الخريفي: "كونوا أقوياء"',
      scopeType: ScopeType.STAGE,
      scopeId: 'stage-prep-boys',
      category: YearPlanCategory.CONFERENCE,
      date: new Date('2026-10-15'),
      endDate: new Date('2026-10-17'),
      description: 'مؤتمر روحي وتكويني لمدة 3 أيام ببيت مارمرقس بالعجمي.',
      createdById: stageSecretary.id,
      isOfficial: true,
    },
  });

  // 9. Create Announcement
  await prisma.announcement.create({
    data: {
      authorId: stageSecretary.id,
      authorRole: Role.STAGE_SECRETARY,
      title: 'تنبيه هام بشأن موعد اجتماع الخدام الأسبوعي',
      content: 'نحيط جميع خدام مرحلة إعدادي بنين علماً بأن اجتماع الخدمة الأسبوعي سيبدأ هذا الأسبوع في تمام الساعة 6:30 مساءً بدلاً من 7:00 لمناقشة ترتيبات المؤتمر الخريفي.',
      targetScopeType: ScopeType.STAGE,
      targetScopeId: 'stage-prep-boys',
      targetRoles: [Role.SERVANT, Role.ASSISTANT_SECRETARY],
    },
  });

  console.log('🎉 Database seeding completed successfully with full realistic data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
