import { Container, Button, Stack } from "@mui/material";
import * as XLSX from "xlsx";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import StudentsTable from "./StudentTable.jsx";

const getStudents = async () => axios.get("/students");
const createManyStudents = async (data) => axios.post("/students", data);

function App() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createManyStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const {
    isPending,
    error,
    data: res,
  } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  console.log(res);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet);
        mutation.mutate(json);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Button
          sx={{ alignSelf: "flex-start" }}
          variant="contained"
          component="label"
          htmlFor="excel"
        >
          Import Excel Data
        </Button>
        <input hidden type="file" id="excel" onChange={handleFileUpload} />
        <StudentsTable
          isPending={isPending || mutation.isPending}
          data={res?.data}
        />
      </Stack>
    </Container>
  );
}

export default App;
