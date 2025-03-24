const users = [
    { username: 'aromal', password: '2642', role: 'admin' },
    { username: 'jobin', password: 'jobin@6378', role: 'user' },
    { username: 'basil', password: 'basil@4181', role: 'user' }
];

exports.login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};