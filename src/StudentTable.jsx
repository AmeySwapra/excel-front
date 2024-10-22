import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Button, Stack, TextField } from "@mui/material";
import _ from "lodash";
import { blue } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

axios.defaults.baseURL = 'https://excel-backend-1-8djc.onrender.com';

const deleteStudents = async (selectedIds) => {
  try {
    const promises = selectedIds.map((id) =>
      axios.delete(`/students/${id}`)
    );
    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error deleting students:", error);
  }
};

const StudentFormPanel = ({ row, student }) => {
  const { id, ...studentData } = student; 
  const { control, handleSubmit } = useForm({
    defaultValues: studentData,
  });

  const queryClient = useQueryClient();

  const onSubmit = async (formData) => {
    try {
      console.log(`Updating student at: ${axios.defaults.baseURL}/students/${id}`); 
      console.log("Updating student with ID:", id); 
      console.log("Form Data:", formData);

      await axios.put(`/students/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      row.toggleExpanded(false); 
    } catch (error) {
      console.error("Error updating student:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      direction="row"
      flexWrap="wrap"
      columnGap={3}
      rowGap={3}
      sx={{ width: '100%' }} 
    >
      {_.keys(studentData).map((item) => (
        <Controller
          key={item}
          control={control}
          name={item}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{
                flexBasis: {
                  xs: "100%", 
                  sm: "48%",  
                  md: "23%",  
                },
                bgcolor: "white",
              }}
              placeholder={`Enter Your ${_.upperFirst(item)}`}
            />
          )}
        />
      ))}
      <Button
        type="submit"
        disableElevation
        variant="contained"
        size="large"
        sx={{ 
          mt: 2, 
          width: {
            xs: '100%', 
            sm: 'auto'
          } 
        }}
      >
        Update Details
      </Button>
    </Stack>
  );
};

const StudentsTable = ({ isPending, data }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "E-mail Address" },
      { accessorKey: "phone", header: "Phone Number" },
      { accessorKey: "section", header: "Section" },
      { accessorKey: "roll", header: "Roll Number" },
    ],
    []
  );

  const table = useMaterialReactTable({
    state: {
      isLoading: isPending,
      showProgressBars: isPending,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
    },
    columns,
    data: data ?? [],
    enableRowSelection: true,
    muiDetailPanelProps: {
      sx: {
        bgcolor: blue[50],
      },
    },
    renderToolbarAlertBannerContent: ({ table, selectedAlert }) => (
      <Stack
        sx={{ p: 2, flexWrap: "wrap", gap: 2 }}
        direction={{ xs: "column", sm: "row" }} 
        alignItems="center"
        justifyContent="flex-start"
      >
        {selectedAlert}
        <Button
          disableElevation
          size="small"
          color="error"
          variant="contained"
          onClick={() => {
            const selectedIds = table
              .getSelectedRowModel()
              .rows.map((item) => item.original.id); 
            mutation.mutate(selectedIds);
            table.toggleAllPageRowsSelected(false);
          }}
        >
          Delete Selected
        </Button>
      </Stack>
    ),
    renderDetailPanel: ({ row }) => {
      const student = _.omit(row.original, ["__v"]);
      return <StudentFormPanel student={student} row={row} />;
    },
  });

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}> 
      <MaterialReactTable table={table} />
    </div>
  );
};

export default StudentsTable;
