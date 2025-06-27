module.exports = async (req, reply) => {
    // Dummy middleware
    req.user = { id: 'demo' }; // Replace with real JWT validation later
};