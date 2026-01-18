const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');

const prisma = new PrismaClient();

const plans = [
  { code: 'SD', name: 'Standard Definition', quality: 'SD', monthlyPrice: 799 },
  { code: 'HD', name: 'High Definition', quality: 'HD', monthlyPrice: 1099 },
  { code: 'UHD', name: 'Ultra HD', quality: 'UHD', monthlyPrice: 1399 },
];

const titles = [
  {
    slug: 'mystic-river',
    name: 'Mystic River',
    synopsis: 'A gritty drama exploring loyalty and justice.',
    type: 'FILM',
    minAge: 'ADULT',
    guidelineFlags: ['VIOLENCE', 'COARSE_LANGUAGE'],
    availableQualities: ['SD', 'HD'],
    genres: ['Drama', 'Thriller'],
    durationMinutes: 138,
  },
  {
    slug: 'galaxy-rangers',
    name: 'Galaxy Rangers',
    synopsis: 'Animated space adventure for the whole family.',
    type: 'SERIES',
    minAge: 'KIDS',
    guidelineFlags: [],
    availableQualities: ['SD', 'HD', 'UHD'],
    genres: ['Animation', 'Adventure'],
    seasons: [
      {
        number: 1,
        episodes: [
          { number: 1, name: 'Launch Day', durationMinutes: 24 },
          { number: 2, name: 'Asteroid Escape', durationMinutes: 24 },
        ],
      },
    ],
  },
];

async function seedPlans() {
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
}

async function seedTitles() {
  for (const title of titles) {
    const created = await prisma.title.upsert({
      where: { slug: title.slug },
      update: {},
      create: {
        slug: title.slug,
        name: title.name,
        synopsis: title.synopsis,
        type: title.type,
        minAge: title.minAge,
        guidelineFlags: title.guidelineFlags || [],
        availableQualities: title.availableQualities || [],
        genres: title.genres || [],
        durationMinutes: title.durationMinutes || null,
      },
    });

    if (title.type === 'SERIES' && Array.isArray(title.seasons)) {
      for (const season of title.seasons) {
        const createdSeason = await prisma.season.upsert({
          where: {
            titleId_number: {
              titleId: created.id,
              number: season.number,
            },
          },
          update: {},
          create: {
            number: season.number,
            titleId: created.id,
          },
        });

        for (const episode of season.episodes) {
          await prisma.episode.upsert({
            where: {
              seasonId_number: {
                seasonId: createdSeason.id,
                number: episode.number,
              },
            },
            update: {},
            create: {
              titleId: created.id,
              seasonId: createdSeason.id,
              number: episode.number,
              name: episode.name,
              durationMinutes: episode.durationMinutes,
            },
          });
        }
      }
    }
  }
}

const testUsers = [
  {
    email: 'demo@streamflix.local',
    password: 'ChangeMe123!',
    status: 'ACTIVE',
    planCode: 'HD',
    profiles: [
      { name: 'Jamie', ageCategory: 'KIDS', preferences: { genres: ['Animation'], minAge: 'KIDS' } },
      { name: 'Taylor', ageCategory: 'ADULT', preferences: { genres: ['Drama', 'Thriller'], minAge: 'ADULT' } },
    ],
  },
  {
    email: 'alice@example.com',
    password: 'Password123!',
    status: 'ACTIVE',
    planCode: 'UHD',
    profiles: [
      { name: 'Alice', ageCategory: 'ADULT', preferences: { genres: ['Drama', 'Thriller'], minAge: 'ADULT' } },
    ],
  },
  {
    email: 'bob@example.com',
    password: 'Password123!',
    status: 'ACTIVE',
    planCode: 'SD',
    profiles: [
      { name: 'Bob', ageCategory: 'ADULT', preferences: { genres: ['Action', 'Adventure'], minAge: 'ADULT' } },
      { name: 'Emma', ageCategory: 'TEEN', preferences: { genres: ['Comedy', 'Romance'], minAge: 'TEEN' } },
    ],
  },
  {
    email: 'charlie@example.com',
    password: 'Password123!',
    status: 'PENDING',
    planCode: null,
    profiles: [],
  },
  {
    email: 'diana@example.com',
    password: 'Password123!',
    status: 'ACTIVE',
    planCode: 'HD',
    profiles: [
      { name: 'Diana', ageCategory: 'ADULT', preferences: { genres: ['Horror', 'Thriller'], minAge: 'ADULT' } },
      { name: 'Max', ageCategory: 'KIDS', preferences: { genres: ['Animation', 'Comedy'], minAge: 'KIDS' } },
      { name: 'Sophie', ageCategory: 'TEEN', preferences: { genres: ['Drama', 'Romance'], minAge: 'TEEN' } },
    ],
  },
];

async function seedUsers() {
  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  for (const userData of testUsers) {
    const account = await prisma.account.upsert({
      where: { email: userData.email },
      update: {
        status: userData.status,
      },
      create: {
        email: userData.email,
        passwordHash: userData.email === 'demo@streamflix.local' 
          ? await bcrypt.hash(userData.password, 12)
          : passwordHash,
        status: userData.status,
        trialEndsAt: userData.status === 'ACTIVE' ? dayjs().add(7, 'day').toDate() : null,
      },
    });

    if (userData.planCode && userData.status === 'ACTIVE') {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { code: userData.planCode } });
      if (plan) {
        await prisma.subscription.upsert({
          where: { accountId: account.id },
          update: {},
          create: {
            accountId: account.id,
            planId: plan.id,
            status: 'TRIAL',
            trialEndsAt: dayjs().add(7, 'day').toDate(),
          },
        });
      }
    }

    for (const profileData of userData.profiles) {
      await prisma.profile.upsert({
        where: {
          id: `${account.id}-${profileData.name.toLowerCase()}`,
        },
        update: {},
        create: {
          id: `${account.id}-${profileData.name.toLowerCase()}`,
          accountId: account.id,
          name: profileData.name,
          ageCategory: profileData.ageCategory,
          preferences: profileData.preferences,
        },
      });
    }
  }
}

async function main() {
  await seedPlans();
  await seedTitles();
  await seedUsers();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

