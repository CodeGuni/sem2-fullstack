exports.getHome = (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
  };