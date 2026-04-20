/**
 * Seed script — populates MongoDB with realistic Toronto sample data
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User         = require('./models/User');
const Issue        = require('./models/Issue');
const Comment      = require('./models/Comment');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI;

// ── Sample users ─────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Alice Resident',  email: 'alice@civiccase.ca',   password: 'Test1234!', role: 'RESIDENT'  },
  { name: 'Bob Resident',    email: 'bob@civiccase.ca',     password: 'Test1234!', role: 'RESIDENT'  },
  { name: 'Sarah Staff',     email: 'sarah@civiccase.ca',   password: 'Test1234!', role: 'STAFF'     },
  { name: 'Mike Staff',      email: 'mike@civiccase.ca',    password: 'Test1234!', role: 'STAFF'     },
  { name: 'Carol Advocate',  email: 'carol@civiccase.ca',   password: 'Test1234!', role: 'ADVOCATE'  },
];

// ── Sample issues with real Toronto addresses ─────────────────────────────────

const ISSUES_TEMPLATE = [
  {
    title: 'Large pothole blocking right lane',
    description: 'A large pothole has formed in the right lane near the intersection, causing vehicles to swerve into oncoming traffic. It has been worsening over the past two weeks.',
    category: 'POTHOLE', priority: 'HIGH', status: 'OPEN',
    location: { address: 'King St W & Bathurst St, Toronto, ON', lat: 43.6441, lng: -79.4035 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pothole_on_a_street_in_Kyiv.jpg/640px-Pothole_on_a_street_in_Kyiv.jpg',
  },
  {
    title: 'Streetlight out for 3 weeks on Danforth',
    description: 'The streetlight at this intersection has been completely dark for over three weeks. The area is very dimly lit at night and feels unsafe for pedestrians and cyclists.',
    category: 'STREETLIGHT', priority: 'MEDIUM', status: 'OPEN',
    location: { address: 'Danforth Ave & Pape Ave, Toronto, ON', lat: 43.6786, lng: -79.3487 },
  },
  {
    title: 'Basement flooding after heavy rain',
    description: 'Storm drain in front of our building is completely blocked with debris. During last night\'s rain, water backed up onto the sidewalk and into several basement units on the street.',
    category: 'FLOODING', priority: 'URGENT', status: 'OPEN',
    location: { address: 'Spadina Ave & College St, Toronto, ON', lat: 43.6579, lng: -79.4040 },
  },
  {
    title: 'Broken glass on playground',
    description: 'Someone has smashed glass bottles on the playground at High Park near the splash pad. There are shards scattered across the rubber matting — dangerous for children playing barefoot.',
    category: 'SAFETY', priority: 'URGENT', status: 'IN_PROGRESS',
    location: { address: 'High Park, 1873 Bloor St W, Toronto, ON', lat: 43.6465, lng: -79.4637 },
  },
  {
    title: 'Overflowing garbage bins near Kensington',
    description: 'The public garbage bins at the entrance to Kensington Market have been overflowing for several days. Trash is spilling onto the sidewalk attracting pests and creating an unpleasant smell.',
    category: 'GARBAGE', priority: 'MEDIUM', status: 'OPEN',
    location: { address: 'Augusta Ave & Nassau St, Kensington Market, Toronto, ON', lat: 43.6547, lng: -79.4004 },
  },
  {
    title: 'Late night noise from construction site',
    description: 'Construction at the new condo development on Front St is operating past 11 PM on weekdays, violating city noise bylaws. Residents in surrounding buildings cannot sleep.',
    category: 'NOISE', priority: 'MEDIUM', status: 'OPEN',
    location: { address: '65 Front St W, Toronto, ON', lat: 43.6453, lng: -79.3806 },
  },
  {
    title: 'Graffiti vandalism on underpass walls',
    description: 'Extensive graffiti has appeared on the underpass walls along the rail corridor. Several of the tags are offensive and visible from the street.',
    category: 'GRAFFITI', priority: 'LOW', status: 'OPEN',
    location: { address: 'Distillery District, 55 Mill St, Toronto, ON', lat: 43.6503, lng: -79.3596 },
  },
  {
    title: 'Multiple potholes on Lawrence Ave W',
    description: 'There are at least four significant potholes along this stretch of Lawrence Ave between Allen Rd and Bathurst St. One has already damaged a vehicle wheel this week.',
    category: 'POTHOLE', priority: 'HIGH', status: 'IN_PROGRESS',
    location: { address: 'Lawrence Ave W & Allen Rd, Toronto, ON', lat: 43.7243, lng: -79.4352 },
  },
  {
    title: 'Traffic light not working at Eglinton & Yonge',
    description: 'The eastbound traffic signal at this busy intersection has been stuck on red for several hours. Traffic is backing up significantly and there have been near-misses.',
    category: 'SAFETY', priority: 'URGENT', status: 'RESOLVED',
    location: { address: 'Eglinton Ave E & Yonge St, Toronto, ON', lat: 43.7071, lng: -79.3982 },
  },
  {
    title: 'Illegal dumping of construction waste',
    description: 'Someone has dumped a large pile of drywall, lumber, and other construction materials in the laneway behind these buildings. It is blocking access for garbage trucks.',
    category: 'GARBAGE', priority: 'HIGH', status: 'OPEN',
    location: { address: 'Bloor St W & Dufferin St, Toronto, ON', lat: 43.6598, lng: -79.4386 },
  },
  {
    title: 'Flooded underpass makes road impassable',
    description: 'The underpass at this location floods every time it rains heavily. Vehicles have stalled trying to pass through standing water. Temporary signage is inadequate.',
    category: 'FLOODING', priority: 'HIGH', status: 'OPEN',
    location: { address: 'Yonge-Dundas Square, 1 Dundas St E, Toronto, ON', lat: 43.6561, lng: -79.3802 },
  },
  {
    title: 'Pedestrian crosswalk lights malfunctioning',
    description: 'The pedestrian crossing signal at this intersection is not audible and the countdown timer is frozen at zero. Seniors and visually impaired residents rely on this signal.',
    category: 'STREETLIGHT', priority: 'MEDIUM', status: 'OPEN',
    location: { address: 'Scarborough Town Centre, 300 Borough Dr, Scarborough, ON', lat: 43.7757, lng: -79.2577 },
  },
  {
    title: 'Graffiti on CN Tower surrounding barriers',
    description: 'Multiple graffiti tags have appeared on the temporary construction barriers surrounding the CN Tower grounds. Tags are visible to thousands of tourists daily.',
    category: 'GRAFFITI', priority: 'MEDIUM', status: 'RESOLVED',
    location: { address: 'CN Tower, 290 Bremner Blvd, Toronto, ON', lat: 43.6426, lng: -79.3871 },
  },
  {
    title: 'Loud music from bar every weekend after 2 AM',
    description: 'A bar on this block has been playing amplified music outdoors until 3 AM every Friday and Saturday night for the past month. Multiple residents have complained with no change.',
    category: 'NOISE', priority: 'MEDIUM', status: 'OPEN',
    location: { address: 'King St W & John St, Toronto, ON', lat: 43.6447, lng: -79.3924 },
  },
  {
    title: 'Cracked sidewalk causing accessibility issues',
    description: 'A section of sidewalk near the bus stop has heaved and cracked significantly, creating a tripping hazard. Several elderly residents and wheelchair users have had difficulty navigating it.',
    category: 'SAFETY', priority: 'MEDIUM', status: 'OPEN',
    location: { address: 'Queen St W & Ossington Ave, Toronto, ON', lat: 43.6432, lng: -79.4246 },
  },
  {
    title: 'Pothole swallowed a cyclist near Union',
    description: 'A deep pothole in the bike lane caused a cyclist to fall this morning. The pothole is approximately 30 cm wide and 15 cm deep. It needs immediate repair.',
    category: 'POTHOLE', priority: 'URGENT', status: 'OPEN',
    location: { address: 'Bay St & Lakeshore Blvd W, Toronto, ON', lat: 43.6386, lng: -79.3809 },
  },
  {
    title: 'Park benches vandalized in Trinity Bellwoods',
    description: 'Three park benches near the tennis courts in Trinity Bellwoods Park have been vandalized — armrests broken and surfaces scratched. Used daily by many park visitors.',
    category: 'OTHER', priority: 'LOW', status: 'RESOLVED',
    location: { address: 'Trinity Bellwoods Park, 790 Queen St W, Toronto, ON', lat: 43.6476, lng: -79.4204 },
  },
  {
    title: 'Street drain blocked causing flooding on Roncesvalles',
    description: 'The storm drain at this corner is completely clogged with leaves and debris. During any moderate rain, water pools 30 cm deep across the full width of the sidewalk.',
    category: 'FLOODING', priority: 'HIGH', status: 'OPEN',
    location: { address: 'Roncesvalles Ave & Howard Park Ave, Toronto, ON', lat: 43.6511, lng: -79.4499 },
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB Atlas…');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Issue.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // Create users
  const users = await Promise.all(
    USERS.map(async (u) => {
      const passwordHash = await bcrypt.hash(u.password, 10);
      return User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
    })
  );
  const [alice, bob, sarah, mike, carol] = users;
  console.log(`Created ${users.length} users.`);

  // Assign reporters
  const reporters = [alice, alice, bob, bob, alice, bob, alice, bob, alice, bob, alice, bob, alice, bob, alice, bob, alice, bob];

  // Create issues
  const issues = await Promise.all(
    ISSUES_TEMPLATE.map((t, i) =>
      Issue.create({
        ...t,
        reportedBy: reporters[i % reporters.length]._id,
        assignedTo: t.status !== 'OPEN' ? sarah._id : null,
        upvotes: i % 3 === 0 ? [alice._id, bob._id, carol._id] : i % 3 === 1 ? [bob._id] : [],
      })
    )
  );
  console.log(`Created ${issues.length} issues.`);

  // Add comments to first 5 issues
  const commentData = [
    { issue: issues[0], author: sarah, body: 'Logged and assigned to the road maintenance crew. Repair estimated within 5 business days.' },
    { issue: issues[0], author: alice, body: 'Thank you! A neighbour\'s car blew a tire on this yesterday. Please prioritize.' },
    { issue: issues[1], author: mike,  body: 'Work order submitted to Toronto Hydro. They will assess within 48 hours.' },
    { issue: issues[2], author: sarah, body: 'Emergency drain clearing crew dispatched. Should be resolved by end of day.' },
    { issue: issues[2], author: bob,   body: 'The flooding reached our front door last night. This is a recurring issue every spring.' },
    { issue: issues[3], author: mike,  body: 'Parks crew dispatched. Area cordoned off until cleanup is complete.' },
    { issue: issues[4], author: carol, body: 'We\'ve organized a community cleanup for Saturday morning. Volunteers welcome!' },
    { issue: issues[7], author: sarah, body: 'Pothole patching crew scheduled for this stretch next Tuesday.' },
  ];

  await Promise.all(commentData.map((c) => Comment.create({ issue: c.issue._id, author: c.author._id, body: c.body })));
  console.log(`Created ${commentData.length} comments.`);

  // Create notifications
  const notifData = [
    { user: alice._id, issue: issues[0]._id, type: 'STATUS_UPDATE',  message: 'Your issue "Large pothole blocking right lane" is now IN_PROGRESS.' },
    { user: bob._id,   issue: issues[3]._id, type: 'STATUS_UPDATE',  message: 'Your issue "Broken glass on playground" is now IN_PROGRESS.' },
    { user: alice._id, issue: issues[2]._id, type: 'URGENT_ALERT',   message: 'Urgent issue reported: Basement flooding after heavy rain' },
    { user: sarah._id, issue: issues[2]._id, type: 'URGENT_ALERT',   message: 'Urgent issue reported: Basement flooding after heavy rain' },
    { user: mike._id,  issue: issues[3]._id, type: 'URGENT_ALERT',   message: 'Urgent issue reported: Broken glass on playground' },
    { user: sarah._id, issue: issues[0]._id, type: 'ASSIGNMENT',     message: 'You have been assigned to: Large pothole blocking right lane' },
  ];

  await Promise.all(notifData.map((n) => Notification.create(n)));
  console.log(`Created ${notifData.length} notifications.`);

  console.log('\n✅  Seed complete!\n');
  console.log('─────────────────────────────────────');
  console.log('Test accounts (password: Test1234!):');
  console.log('  Resident : alice@civiccase.ca');
  console.log('  Resident : bob@civiccase.ca');
  console.log('  Staff    : sarah@civiccase.ca');
  console.log('  Staff    : mike@civiccase.ca');
  console.log('  Advocate : carol@civiccase.ca');
  console.log('─────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
