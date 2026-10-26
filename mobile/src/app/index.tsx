import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={bgImage}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay}>
          {/* Top Header Tag */}
          <View style={styles.tag}>
            <Ionicons name="barbell-outline" size={16} color="#38BDF8" />
            <Text style={styles.tagText}>GESTÃO ACADEMIA</Text>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.title}>Foco, disciplina e evolução</Text>
            <Text style={styles.subtitle}>
              Organize seus treinos semanais, acompanhe a duração das sessões e
              mantenha a consistência da sua rotina.
            </Text>

            {/* Quick Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusIconBox}>
                <Ionicons name="fitness-outline" size={22} color="#0284C7" />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusValue}>{totalTreinos} treinos</Text>
                <Text style={styles.statusLabel}>
                  {totalTreinos === 0
                    ? "Comece cadastrando seu primeiro treino"
                    : "Cadastrados na sua rotina semanal"}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions Bottom */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push({ pathname: "/treinos" })}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Ver Meus Treinos</Text>
              <Ionicons
                name="arrow-forward-outline"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push({ pathname: "/treinos/novo" })}
              activeOpacity={0.8}
            >
              <Ionicons name="add-outline" size={18} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Cadastrar Treino</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
=======
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
>>>>>>> parent of 01a7d80 (Merge pull request #93 from eu-joao/9-navegacao-e-listagem-treinos)
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
