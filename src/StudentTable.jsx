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

const deleteStudents = async (selectedIds) => {
  try {
    const promises = selectedIds.map((id) =>
      axios.delete(`${axios.defaults.baseURL}/students/${id}`)
    );
    await Promise.allSettled(promises);
  } catch (error) {
    console.error(error);
  }
};

const StudentFormPanel = (props) => {
  const { row } = props;
  const { _id, ...student } = props.student;
  const { control, handleSubmit } = useForm({
    defaultValues: student,
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data) => {
    try {
      await axios.put(`${axios.defaults.baseURL}/students/${_id}`, data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      row.toggleExpanded(false);
    } catch (error) {
      console.error("Failed to update student:", error);
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
    >
      {_.keys(student).map((item) => (
        <Controller
          key={item}
          control={control}
          name={item}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ flexBasis: "23%", bgcolor: "white" }}
              placeholder={`Enter Your ${_.upperFirst(item)}`}
            />
          )}
        />
      ))}
      <Button type="submit" disableElevation variant="contained" size="large">
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
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "E-mail Address",
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
      },
      {
        accessorKey: "section",
        header: "Section",
      },
      {
        accessorKey: "roll",
        header: "Roll Number",
      },
    ],
    [data]
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
        sx={{ p: 2 }}
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
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
              .rows.map((item) => item.original._id);
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

  return <MaterialReactTable table={table} />;
};

export default StudentsTable;
