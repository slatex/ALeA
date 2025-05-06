create database comments_test;
use comments_test;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'abctest';

CREATE TABLE comments (
    commentId int PRIMARY KEY AUTO_INCREMENT,
    archive varchar(255),
    filepath varchar(255),

    parentCommentId int,
    threadId int,
    statement text,
    commentType ENUM('QUESTION', 'REMARK', 'OTHER'),
    questionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER'),
    courseId varchar(255),
    courseTerm varchar(255),
    isEdited tinyint,
    isPrivate tinyint,
    isDeleted tinyint,

    hiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    hiddenJustification varchar(255),

    selectedText text,
    selectedElement text,

    isAnonymous tinyint,
    userId varchar(255),
    userName varchar(255),
    userEmail varchar(255),

    postedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE updateHistory (
   updateId int PRIMARY KEY AUTO_INCREMENT,
    ownerId varchar(255),
    updaterId varchar(255),
    commentId int NOT NULL,
    previousStatement text,
    previousHiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    previousHiddenJustification varchar(255),
    previousQuestionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER'),
    
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points (
    points int,
    reason varchar(255),
    
    userId varchar(255),
	commentId int unique,
    granterId varchar(255),
    
	grantTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    updateId INT PRIMARY KEY AUTO_INCREMENT,
    userId VARCHAR(255),
    header VARCHAR(255),
    content VARCHAR(255),
    header_de VARCHAR(255),
    content_de VARCHAR(255),
    link VARCHAR(255),
    notificationType VARCHAR(255),
    postedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE userInfo (
    userId VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    languages VARCHAR(255),
    studyProgram VARCHAR(255),
    semester VARCHAR(255),
    notificationSeenTs VARCHAR(255),
    showTrafficLight BOOLEAN DEFAULT TRUE,
    showSectionReview BOOLEAN DEFAULT TRUE,
    saltedPassword VARCHAR(255),
    verificationToken VARCHAR(255),
    isVerified BOOLEAN,
    passwordResetToken VARCHAR(255),
    passwordResetRequestTimestampMs BIGINT
);

CREATE TABLE StudyBuddyUsers (
    userId VARCHAR(255) NOT NULL,
    sbCourseId VARCHAR(255) NOT NULL,

    active BOOLEAN NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    userName VARCHAR(255),
    intro VARCHAR(1023),
    studyProgram VARCHAR(255),
    semester INT,
    meetType VARCHAR(255),
    languages VARCHAR(255),
    dayPreference VARCHAR(255),
    createdTimestamp timestamp DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (userId, sbCourseId)
);

CREATE TABLE BlogPosts (
    postId VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    authorId VARCHAR(100) NOT NULL,
    authorName VARCHAR(255) NOT NULL,
    heroImageId VARCHAR(255),
    heroImageUrl VARCHAR(255),
    heroImagePosition VARCHAR(255),

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE CdnImages (
    id VARCHAR(255) NOT NULL,
    metadata JSON NOT NUll
);

CREATE TABLE StudyBuddyConnections (
    senderId VARCHAR(255) NOT NULL,
    receiverId VARCHAR(255) NOT NULL,
    sbCourseId VARCHAR(255) NOT NULL,
    timeOfIssue TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (senderId, receiverId, sbCourseId)
);

CREATE TABLE AccessControlList (
    id VARCHAR  (255) PRIMARY KEY,
    description TEXT,
    updaterACLId VARCHAR(255),
    isOpen BOOLEAN,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ACLMembership(
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    parentACLId VARCHAR(255) NOT NULL,
    memberACLId VARCHAR(255) NULL,
    memberUserId VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentACLId) REFERENCES AccessControlList(id)
);

CREATE TABLE ResourceAccess(
    resourceId VARCHAR(255) NOT NULL,
    actionId VARCHAR(255) NOT NULL,
    aclId VARCHAR(255) NOT NULL,
    PRIMARY KEY (resourceId, actionId),
    FOREIGN KEY(aclId) REFERENCES AccessControlList(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP    
);

ALTER TABLE StudyBuddyConnections ADD CONSTRAINT StudyBuddyConnections_fk0 FOREIGN KEY (senderId) REFERENCES StudyBuddyUsers(userId);
ALTER TABLE StudyBuddyConnections ADD CONSTRAINT StudyBuddyConnections_fk1 FOREIGN KEY (receiverId) REFERENCES StudyBuddyUsers(userId);

/* Query to get 2-way connections */
SELECT DISTINCT t1.senderId, t1.receiverId FROM StudyBuddyConnections t1 JOIN StudyBuddyConnections t2 ON t1.senderId = t2.receiverId AND t1.receiverId = t2.senderId WHERE t1.senderId < t1.receiverId;

/* Query to get 1-way connection requests */
SELECT t1.senderId, t1.receiverId FROM StudyBuddyConnections t1 LEFT JOIN StudyBuddyConnections t2 ON t1.senderId = t2.receiverId AND t1.receiverId = t2.senderId WHERE t2.senderId IS NULL AND t2.receiverId IS NULL AND t1.senderId < t1.receiverId;
-- this is related to homework database
CREATE TABLE Answer  (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  questionId varchar(255) NOT NULL,
  subProblemId varchar(255) NULL,
  userId varchar(255) NOT NULL,
  answer TEXT NULL,
  questionTitle TEXT NULL,
  courseId varchar(255) NULL,
  courseInstance varchar(255) NULL,
  homeworkId INT NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Grading  (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  checkerId varchar(255) NOT NULL,
  reviewType enum('SELF', 'INSTRUCTOR', 'PEER') NOT NULL,
  
  answerId int UNSIGNED NOT NULL,
  customFeedback TEXT NULL,
  totalPoints float NOT NULL,
  homeworkId INT NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (answerId) REFERENCES Answer (id) ON DELETE CASCADE
);

CREATE TABLE GradingAnswerClass  (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  gradingId int UNSIGNED NOT NULL,
  answerClassId varchar(255) NOT NULL,
  points float NOT NULL,
  isTrait boolean NOT NULL,
  closed boolean NOT NULL,
  title varchar(255) NOT NULL,
  description TEXT NULL,
  count int NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (gradingId) REFERENCES Grading (id) ON DELETE CASCADE
);

CREATE TABLE ReviewRequest   (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  reviewType enum('INSTRUCTOR','PEER') NOT NULL,
  answerId  int UNSIGNED NOT NULL,
  userId varchar(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (answerId) REFERENCES Answer (id) ON DELETE CASCADE
);

CREATE TABLE homework (
    id INT PRIMARY KEY AUTO_INCREMENT,
    versionNo INT,
    title VARCHAR(255),          
    givenTs TIMESTAMP,
    dueTs TIMESTAMP,                  
    feedbackReleaseTs TIMESTAMP,                  
    courseId VARCHAR(255),                
    courseInstance VARCHAR(255),
    problems JSON,
    updaterId VARCHAR(255),

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE homeworkHistory (
    id INT,
    versionNo INT,
    title VARCHAR(255),          
    givenTs TIMESTAMP,
    dueTs TIMESTAMP,                  
    feedbackReleaseTs TIMESTAMP,                  
    courseId VARCHAR(255),                
    courseInstance VARCHAR(255),
    problems JSON,
    updaterId VARCHAR(255),
    
    createdAt TIMESTAMP,
    
    PRIMARY KEY (id, versionNo)   
);

-- Job Portal Tables
CREATE TABLE StudentProfile (
    userId VARCHAR(50) PRIMARY KEY, 
    name VARCHAR(255) NOT NULL, 
    resumeURL VARCHAR(2083), 
    email VARCHAR(255) NOT NULL, 
    contactNo VARCHAR(15), 
    programme VARCHAR(255) NOT NULL, 
    yearOfAdmission YEAR NOT NULL, 
    yearOfGraduation YEAR, 
    courses TEXT, 
    grades TEXT, 
    about TEXT, 
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES userInfo(userId) 
);

CREATE TABLE organizationprofile (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    companyName VARCHAR(255) , 
    incorporationYear YEAR ,
    isStartup  ENUM('Yes', 'No'),
    website VARCHAR(255),
    about TEXT, 
    companyType VARCHAR(255),
    officeAddress VARCHAR(255), 
    officePincode VARCHAR(255) 
);


CREATE TABLE RecruiterProfile (
    userId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL, 
    organizationId INT ,
    mobile VARCHAR(15) ,
    altMobile VARCHAR (15),
    hasDefinedOrg tinyint,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    CONSTRAINT fk_recruiter FOREIGN KEY (userId) REFERENCES userInfo(userId) ,
    CONSTRAINT fk_organization FOREIGN KEY (organizationId) REFERENCES organizationprofile(id)

);

CREATE TABLE jobCategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobCategory ENUM('internship', 'full-time') NOT NULL,
    internshipPeriod VARCHAR(255),
    startDate DATE,
    endDate DATE,
    instanceId VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Admin (
    id SERIAL PRIMARY KEY,                  
    name VARCHAR(255) NOT NULL,            
    email VARCHAR(255) UNIQUE NOT NULL,    
    universityName VARCHAR(255) NOT NULL,  
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
);

CREATE TABLE JobPost (
    id INT AUTO_INCREMENT PRIMARY KEY,                          
    organizationId INT,                                          
    JobCategoryId INT,                                               
    session VARCHAR(255),                                         
    jobTitle VARCHAR(255),                                        
    jobDescription TEXT,                                          
    trainingLocation VARCHAR(255),                                
    qualification VARCHAR(255),                                   
    targetYears VARCHAR(255),                                     
    openPositions INT,                                            
    currency VARCHAR(50),                                         
    stipend DECIMAL(10, 2),                                       
    facilities TEXT,                                              
    applicationDeadline DATETIME,                                 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
    FOREIGN KEY (organizationId) REFERENCES organizationprofile(id),  
    FOREIGN KEY (JobCategoryId) REFERENCES jobCategories(id)                
);


CREATE TABLE JobApplication (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    jobPostId INT, 
    applicantId VARCHAR(50), 
    applicationStatus ENUM('APPLIED', 'ACCEPTED', 'REJECTED', 'OFFERED', 'PROCESSING') NOT NULL,
    applicantAction ENUM('ACCEPT_OFFER', 'REJECT_OFFER') DEFAULT NULL,
    recruiterAction ENUM('ACCEPT', 'REJECT', 'SEND_OFFER') DEFAULT NULL,
    studentMessage VARCHAR(255), 
    recruiterMessage VARCHAR(255), 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobPost FOREIGN KEY (jobPostId) REFERENCES JobPost(id) ,
    CONSTRAINT fk_applicant FOREIGN KEY (applicantId) REFERENCES StudentProfile(id) 
);
