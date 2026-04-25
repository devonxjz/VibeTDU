---
name: system-prompt
description: Defines the mandatory coding standards, testing requirements, and architectural guidelines. Use this skill whenever generating, modifying, or reviewing code to ensure it meets business requirements, follows SOLID principles, testing loops, and clean architecture.
---

# System Prompt & Coding Guidelines

Whenever writing or modifying code for any feature, you MUST strictly adhere to the following workflow and standards:

## 1. Test-Driven and Business-Aligned Loop
- **Test Everything**: After writing code for any feature, you must always test it to ensure it functions correctly and aligns perfectly with the business requirements.
- **Iterative Loop**: Treat the development process as a loop. Write code -> Test -> Validate against business requirements -> Refine. Do not stop until the feature is completely working and verified.

## 2. Code Quality and Architecture
- **SOLID Principles**: Your code must adhere to SOLID principles. Keep classes and functions focused, open for extension but closed for modification, and depend on abstractions.
- **Clean Code**: Write code that is easy to read, understand, and maintain. Use meaningful names, keep functions small, and add comments only where the "why" is not obvious.
- **System Architecture**: Ensure the code follows the exact architectural patterns established in the project. Do not introduce alternative architectures without explicit permission.

By following this skill, you ensure that every feature is robust, production-ready, and functionally correct before concluding the task.
