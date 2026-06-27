// Script to create a test user in localStorage for testing the greeting feature
const createTestUser = () => {
  // Create a test user
  const testUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    userType: "user"
  };
  
  // Store in localStorage
  localStorage.setItem("user", JSON.stringify(testUser));
  
  console.log("Test user created:", testUser);
  console.log("Refresh the page to see the greeting");
};

// Run the function
createTestUser();