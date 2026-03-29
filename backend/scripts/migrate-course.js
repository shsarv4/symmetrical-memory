#!/usr/bin/env node

/**
 * Migration script: Import course.json data into Firestore modules collection
 *
 * Usage: node backend/scripts/migrate-course.js [--force]
 *
 * Options:
 *   --force    Overwrite existing modules (default: skip if exists)
 *
 * This script reads the frontend/course.json file and creates/updates
 * documents in the Firestore 'modules' collection.
 */

const path = require('path');
const fs = require('fs');

// Add backend directory to path to access Firebase Admin
process.chdir(path.join(__dirname, '..'));

const { initializeAdmin, admin } = require(path.join(__dirname, '..', 'firebase', 'admin'));

async function migrate() {
  const force = process.argv.includes('--force');
  console.log('🚀 Starting course data migration...\n');

  try {
    // Initialize Firebase Admin
    initializeAdmin();
    const db = require(path.join(__dirname, '..', 'firebase', 'admin')).getFirestore();
    console.log('✅ Firebase Admin initialized\n');

    // Load course.json
    const coursePath = path.join(__dirname, '..', '..', 'frontend', 'course.json');
    if (!fs.existsSync(coursePath)) {
      throw new Error(`course.json not found at: ${coursePath}`);
    }

    const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf-8'));
    console.log(`📚 Loaded course: ${courseData.meta.title}\n`);

    const { modules } = courseData;

    if (!Array.isArray(modules) || modules.length === 0) {
      throw new Error('No modules found in course.json');
    }

    console.log(`Found ${modules.length} modules to migrate\n`);

    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    // Process each module
    for (const module of modules) {
      const moduleId = module.id;

      console.log(`Processing: ${module.title} (${moduleId})`);

      // Check if module already exists
      const doc = await db.collection('modules').doc(moduleId).get();

      // Prepare module data for Firestore
      const moduleData = {
        id: moduleId,
        title: module.title,
        subtitle: module.subtitle,
        icon: module.icon || '📚',
        accent: module.accent || '#c084fc',
        topics: module.topics.map(topic => ({
          id: topic.id,
          title: topic.title,
          subtopics: Array.isArray(topic.subtopics) ? topic.subtopics : []
        })),
        resources: Array.isArray(module.resources) ? module.resources : [],
        exercises: Array.isArray(module.exercises) ? module.exercises : [],
        // Set order based on array index + 1
        order: module.order || (modules.indexOf(module) + 1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // If creating new record, add createdAt
      if (!doc.exists) {
        moduleData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      if (doc.exists) {
        if (force) {
          // Overwrite existing
          await db.collection('modules').doc(moduleId).set(moduleData, { merge: true });
          console.log(`  ✓ Updated (forced)`);
          updatedCount++;
        } else {
          // Skip existing
          console.log(`  ⏭️  Skipped (already exists, use --force to overwrite)`);
          skippedCount++;
        }
      } else {
        // Create new
        await db.collection('modules').doc(moduleId).set(moduleData);
        console.log(`  ✓ Created`);
        createdCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total:   ${modules.length}`);
    console.log('='.repeat(50));
    console.log('\n✅ Migration complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
migrate();
