# Contributing to Visual AI Agent

Thank you for considering contributing to Visual AI Agent! 🎉

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/lalith-sky/sde/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "Add: Description of your feature"
   ```
   
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes
   - `Refactor:` for code refactoring
   - `Test:` for adding tests

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description
   - Link related issues
   - Explain your changes

## Development Setup

See [QUICKSTART.md](./QUICKSTART.md) for setup instructions.

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Maintain type safety
- Avoid `any` types when possible

### Code Style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Follow existing patterns

### Testing
- Write tests for new features
- Ensure existing tests pass
- Aim for good code coverage

```bash
cd server
npm test
```

## Project Structure

- `server/` - Backend Express API
- `dashboard/` - React Dashboard
- `extension/` - Chrome Extension
- `docs/` - Documentation

## Commit Message Guidelines

Good commit messages:
```
Add: User authentication with JWT tokens
Fix: Screenshot capture on system pages
Update: Dashboard UI for better responsiveness
Docs: Add API documentation for activities endpoint
```

## Need Help?

- Read the [README.md](./README.md)
- Check [QUICKSTART.md](./QUICKSTART.md)
- Ask questions in GitHub Discussions
- Review existing issues and PRs

Thank you for contributing! 🙏
