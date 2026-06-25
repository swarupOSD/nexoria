import fetch from 'node-fetch';
import mongoose from 'mongoose';

async function testPostEndpoints() {
  console.log("Fetching token...");
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@test.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;

  if (!token) {
    console.log("Login failed", loginData);
    return;
  }

  console.log("Fetching categories...");
  const catRes = await fetch('http://localhost:5000/api/categories');
  const catData = await catRes.json();
  const categoryId = catData.data[0]._id;

  console.log("Creating post...");
  const newPost = {
    title: "Test App",
    slug: "test-app",
    packageName: "com.test.app",
    appLogo: "logo.png",
    featuredImage: "featured.png",
    category: categoryId,
    version: "1.0",
    publisher: "Tester",
    content: "<p>Test Content</p>",
    status: "Published",
    galleryImages: ["img1.png", "img2.png"],
    modFeatures: ["Feature 1", "Feature 2"],
    downloadLinks: [
      { label: "Primary", url: "http://test.com/dl1", type: "primary", isActive: true, priority: 1 },
      { label: "Mirror", url: "http://test.com/dl2", type: "mirror", isActive: true, priority: 2 }
    ],
    isFeatured: true,
    isTrending: true,
    isPopular: false,
    editorChoice: true,
    changelog: "Initial Release"
  };

  const createRes = await fetch('http://localhost:5000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newPost)
  });
  
  const createdData = await createRes.json();
  console.log("Create Post Result:", createdData.success ? "SUCCESS" : createdData);
  
  if (!createdData.success) return;
  
  const postId = createdData.data._id;
  const postSlug = createdData.data.slug;

  console.log("Fetching created post by slug...");
  const getRes = await fetch(`http://localhost:5000/api/posts/${postSlug}`);
  const getData = await getRes.json();
  
  console.log("Persistence Check:");
  console.log("- Gallery Images:", getData.data.galleryImages.length === 2 ? "PASS" : "FAIL");
  console.log("- Mod Features:", getData.data.modFeatures.length === 2 ? "PASS" : "FAIL");
  console.log("- Download Links:", getData.data.downloadLinks.length === 2 ? "PASS" : "FAIL");
  console.log("- Toggles (Featured, Trending, EditorChoice):", getData.data.isFeatured && getData.data.isTrending && getData.data.editorChoice ? "PASS" : "FAIL");
  console.log("- Changelog:", getData.data.changelog === "Initial Release" ? "PASS" : "FAIL");

  console.log("Updating post...");
  const updateData = {
    ...getData.data,
    title: "Test App Updated",
    changelog: "Updated Release",
    modFeatures: ["Feature 1", "Feature 2", "Feature 3"],
    downloadLinks: [
      { label: "Primary", url: "http://test.com/dl1", type: "primary", isActive: true, priority: 1 }
    ],
    isFeatured: false
  };

  const updateRes = await fetch(`http://localhost:5000/api/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
  const updatedResult = await updateRes.json();
  console.log("Update Post Result:", updatedResult.success ? "SUCCESS" : updatedResult);

  const getRes2 = await fetch(`http://localhost:5000/api/posts/${postSlug}`);
  const getData2 = await getRes2.json();
  
  console.log("Update Persistence Check:");
  console.log("- Mod Features (Expected 3):", getData2.data.modFeatures.length === 3 ? "PASS" : "FAIL");
  console.log("- Download Links (Expected 1):", getData2.data.downloadLinks.length === 1 ? "PASS" : "FAIL");
  console.log("- Toggles (isFeatured expected false):", !getData2.data.isFeatured ? "PASS" : "FAIL");
  console.log("- Changelog:", getData2.data.changelog === "Updated Release" ? "PASS" : "FAIL");

  console.log("Deleting post...");
  const delRes = await fetch(`http://localhost:5000/api/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const delData = await delRes.json();
  console.log("Delete Post Result:", delData.success ? "SUCCESS" : "FAIL");
}

testPostEndpoints().catch(console.error);
