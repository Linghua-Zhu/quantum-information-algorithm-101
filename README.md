# Quantum Information and Programming 101

From vectors to qubits to algorithms. Predict first, then observe.

**Open the course:** https://linghua-zhu.github.io/quantum-information-algorithm-101/

A course tool for a first course in quantum information and quantum programming. Students work through each topic by committing to an answer, watching what the physics does, and explaining the difference. The same circuits then become code that runs on a simulator or on a real quantum computer.

## Units

| Unit | Topic | |
|---|---|---|
| 0 | Vectors, rotations and phase | In preparation |
| 1 | One qubit: states, gates, measurement, Pauli operators and noise on the Bloch sphere | Open |
| 2 | Two qubits: product states, entanglement, CNOT and the Bell states | In preparation |
| 3 | Algorithms: Deutsch-Jozsa, Grover search, teleportation, phase estimation, the variational eigensolver | In preparation |
| 4 | Noise and real hardware | In preparation |
| R | Research: open questions that start from experiments on real devices | In preparation |

Every unit has the same six parts.

- **Goals.** What students will be able to do, with their progress on each goal.
- **Start here.** The conventions, and one worked example for each topic.
- **Practice.** Predict, observe, explain. Missed items come back.
- **Discuss.** Questions to argue over, with a reason for every option.
- **Explore.** A sandbox with no questions asked.
- **Code.** The same circuit as a Qiskit program for a simulator or a real device.

## How each question works

1. **Predict.** The student commits to an answer before anything moves: a point on the sphere, a number or a choice.
2. **Observe.** The tool shows what happens and says how the answer relates to it.
3. **Explain.** The student writes one sentence about the result and compares it with a reference.

Committing first is what makes the observation informative. It shows exactly where the student's picture of the physics and the physics part ways.

## How it is designed

**Predict first.** Students who predict the outcome of a demonstration before seeing it understand it better than students who only watch (Crouch et al. 2004). Predict, observe and explain are modelled on the strategy elicit, confront, resolve (McDermott 2001).

**Feedback on the answer given.** The practice recognises common wrong answers. The feedback says what a wrong answer corresponds to, for example the state after the first gate alone, or the probability of the other outcome. It is about the task and the reasoning, not about the student. Feedback aimed at the person, such as praise, rarely helps learning (Hattie and Timperley 2007). The physics is computed in the page, so each prediction gets feedback specific to it, and the same answer always gets the same feedback.

**Help that fades.** Start here works through one example for each topic. In the practice the help then fades. The first items show the rotation axis, the sense of the turn or the measurement axis on the sphere. Later items show less, and the last ones show nothing. This adapts the fading of worked examples, which moves learners step by step from studying examples to solving problems on their own (Renkl and Atkinson 2003).

**Missed items come back.** A missed item returns a few items later and again the next day. An item answered correctly returns after 3, 7, 14 and 30 days, without hints. Recalling an answer improves long-term retention more than studying it again (Roediger and Karpicke 2006). So does spreading practice over several days instead of one session (Cepeda et al. 2006).

**A reason for every option.** Each idea in a unit has one question for discussion. Students answer alone, talk it over and answer again (Crouch and Mazur 2001). Then they read the reasons for every option: why each wrong option is tempting, and where it breaks down. Several of the wrong options are answers that students give in published studies (Passante et al. 2015; Wan et al. 2019; Hu, Li, Mong and Singh 2024; Hu, Li and Singh 2024).

**One idea, several representations.** A state appears as amplitudes, as a point on the sphere, as numbers and as a circuit, and the worked examples translate from one to another (Ainsworth 2006). The Code part turns the circuit into a Qiskit program. Students predict what the program prints, run it, and then change it. These are the first steps of the PRIMM approach to teaching programming (Sentance et al. 2019).

**Open to every student.** The tool is free and needs no account and no installation. It works on a phone as well as a computer, in a light and a dark theme, and with a keyboard alone. Every result is stated in words as well as drawn.

## For instructors

- Each discussion question has a **Use in class** panel with the question and its options as plain text for a polling tool.
- Students can copy their responses, as comma-separated text, from the About page of the tool.
- Nothing is sent anywhere. Progress is stored in each student's own browser.
- The whole course is one file, `docs/index.html`. It can be downloaded and opened in a browser without an internet connection.

## References

- Ainsworth, S. (2006). DeFT: A conceptual framework for considering learning with multiple representations. *Learning and Instruction, 16*(3), 183–198. https://doi.org/10.1016/j.learninstruc.2006.03.001
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354
- Crouch, C. H., Fagen, A. P., Callan, J. P., & Mazur, E. (2004). Classroom demonstrations: Learning tools or entertainment? *American Journal of Physics, 72*(6), 835–838. https://doi.org/10.1119/1.1707018
- Crouch, C. H., & Mazur, E. (2001). Peer Instruction: Ten years of experience and results. *American Journal of Physics, 69*(9), 970–977. https://doi.org/10.1119/1.1374249
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112. https://doi.org/10.3102/003465430298487
- Hu, P., Li, Y., Mong, R. S. K., & Singh, C. (2024). Student understanding of the Bloch sphere. *European Journal of Physics, 45*(2), 025705. https://doi.org/10.1088/1361-6404/ad2393
- Hu, P., Li, Y., & Singh, C. (2024). Investigating and improving student understanding of the basics of quantum computing. *Physical Review Physics Education Research, 20*(2), 020108. https://doi.org/10.1103/PhysRevPhysEducRes.20.020108
- McDermott, L. C. (2001). Oersted Medal Lecture 2001: "Physics Education Research—The key to student learning." *American Journal of Physics, 69*(11), 1127–1137. https://doi.org/10.1119/1.1389280
- Passante, G., Emigh, P. J., & Shaffer, P. S. (2015). Student ability to distinguish between superposition states and mixed states in quantum mechanics. *Physical Review Special Topics - Physics Education Research, 11*(2), 020135. https://doi.org/10.1103/PhysRevSTPER.11.020135
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition: A cognitive load perspective. *Educational Psychologist, 38*(1), 15–22. https://doi.org/10.1207/S15326985EP3801_3
- Roediger, H. L., III, & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Sentance, S., Waite, J., & Kallia, M. (2019). Teaching computer programming with PRIMM: A sociocultural perspective. *Computer Science Education, 29*(2–3), 136–176. https://doi.org/10.1080/08993408.2019.1608781
- Wan, T., Emigh, P. J., & Shaffer, P. S. (2019). Probing student reasoning in relating relative phase and quantum phenomena. *Physical Review Physics Education Research, 15*(2), 020139. https://doi.org/10.1103/PhysRevPhysEducRes.15.020139

## License

© 2026 Linghua Zhu. The code is released under the [MIT License](LICENSE). The course text, questions and explanations are released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
