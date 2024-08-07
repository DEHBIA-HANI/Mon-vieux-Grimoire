const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //definir le format de l'email
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    //Vérification de la validité de l'email
    if (!emailFormat.test(req.body.email)) {
      return res.status(400).json({ error: "Format de l'e-mail non valide" });
    }
    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe manquant." });
    }
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Envoyer une réponse réussie
    res.status(201).json({ message: "Utilisateur créé avec succès!" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe manquant." });
    }
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Paire identifiant/mot de passe incorrect." });
    }
    // Vérifier si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Paire identifiant/mot de passe incorrect." });
    }
    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Envoyer une réponse avec le token et l'ID de l'utilisateur
    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    res.status(500).json({ error });
  }
};
